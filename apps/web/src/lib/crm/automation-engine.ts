import { prisma, Prisma } from "@salud-prolab/database";
import type { CrmAutomationTrigger, CrmActivityType } from "@salud-prolab/database";

type TriggerContext = {
  contactId?: string;
  leadId?: string;
  dealId?: string;
  stageId?: string;
  previousStageId?: string;
  pipelineId?: string;
  userId?: string;
};

/**
 * Executes all active automations matching the given trigger.
 * Called synchronously from API handlers after relevant CRM events.
 */
export async function executeAutomations(
  trigger: CrmAutomationTrigger,
  context: TriggerContext
): Promise<void> {
  try {
    const automations = await prisma.crmAutomation.findMany({
      where: {
        active: true,
        trigger,
        ...(context.pipelineId ? { pipelineId: context.pipelineId } : {}),
      },
    });

    for (const automation of automations) {
      // Create WorkflowRun for tracking
      const run = await prisma.workflowRun.create({
        data: {
          automationId: automation.id,
          triggeredBy: context.userId || null,
          status: "EN_EJECUCION",
        },
      });

      try {
        await executeAction(automation.action, automation.actionConfig, context);

        // Log success
        await prisma.workflowLog.create({
          data: {
            runId: run.id,
            step: 1,
            action: automation.action,
            input: context as unknown as Prisma.InputJsonValue,
            output: { result: "ok" },
            success: true,
          },
        });

        // Mark run as completed
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: { status: "COMPLETADO", completedAt: new Date() },
        });

        // Update execution stats
        await prisma.crmAutomation.update({
          where: { id: automation.id },
          data: {
            executionCount: { increment: 1 },
            lastExecutedAt: new Date(),
          },
        });
      } catch (err) {
        console.error(`Automation ${automation.id} (${automation.name}) failed:`, err);

        // Log failure
        await prisma.workflowLog
          .create({
            data: {
              runId: run.id,
              step: 1,
              action: automation.action,
              input: context as unknown as Prisma.InputJsonValue,
              output: { error: err instanceof Error ? err.message : "Unknown error" },
              success: false,
            },
          })
          .catch(() => {});

        await prisma.workflowRun
          .update({
            where: { id: run.id },
            data: {
              status: "FALLIDO",
              completedAt: new Date(),
              error: err instanceof Error ? err.message : "Unknown error",
            },
          })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.error(`executeAutomations error for trigger ${trigger}:`, err);
  }
}

async function executeAction(
  action: string,
  config: unknown,
  context: TriggerContext
): Promise<void> {
  const cfg = (config || {}) as Record<string, unknown>;

  switch (action) {
    case "CREAR_ACTIVIDAD":
      await prisma.crmActivity.create({
        data: {
          type: ((cfg.activityType as string) || "NOTA") as CrmActivityType,
          subject: (cfg.subject as string) || "Actividad automática",
          body: (cfg.body as string) || undefined,
          contactId: context.contactId || null,
          leadId: context.leadId || null,
          dealId: context.dealId || null,
          createdById: context.userId || "",
        },
      });
      break;

    case "MOVER_ETAPA":
      if (cfg.targetStageId) {
        if (context.leadId) {
          await prisma.crmLead.update({
            where: { id: context.leadId },
            data: { stageId: cfg.targetStageId as string },
          });
        }
        if (context.dealId) {
          await prisma.crmDeal.update({
            where: { id: context.dealId },
            data: { stageId: cfg.targetStageId as string },
          });
        }
      }
      break;

    case "ASIGNAR_USUARIO":
      if (cfg.assignToUserId) {
        if (context.leadId) {
          await prisma.crmLead.update({
            where: { id: context.leadId },
            data: { assignedToId: cfg.assignToUserId as string },
          });
        }
        if (context.dealId) {
          await prisma.crmDeal.update({
            where: { id: context.dealId },
            data: { assignedToId: cfg.assignToUserId as string },
          });
        }
        if (context.contactId) {
          await prisma.crmContact.update({
            where: { id: context.contactId },
            data: { assignedToId: cfg.assignToUserId as string },
          });
        }
      }
      break;

    case "ENVIAR_EMAIL":
      // Create activity record for email action (actual sending handled by campaign system)
      await prisma.crmActivity.create({
        data: {
          type: "EMAIL" as CrmActivityType,
          subject: (cfg.emailSubject as string) || "Email automático",
          body: (cfg.emailBody as string) || undefined,
          contactId: context.contactId || null,
          leadId: context.leadId || null,
          dealId: context.dealId || null,
          createdById: context.userId || "",
        },
      });
      break;

    case "ENVIAR_WHATSAPP":
      // Create activity record for WhatsApp action
      await prisma.crmActivity.create({
        data: {
          type: "WHATSAPP" as CrmActivityType,
          subject: (cfg.templateName as string) || "WhatsApp automático",
          body: (cfg.body as string) || undefined,
          contactId: context.contactId || null,
          leadId: context.leadId || null,
          dealId: context.dealId || null,
          createdById: context.userId || "",
        },
      });
      break;

    case "NOTIFICAR":
      // Create a notification activity visible to the assigned user
      await prisma.crmActivity.create({
        data: {
          type: "NOTA" as CrmActivityType,
          subject: (cfg.message as string) || "Notificación automática",
          contactId: context.contactId || null,
          leadId: context.leadId || null,
          dealId: context.dealId || null,
          createdById: context.userId || "",
        },
      });
      break;

    default:
      console.warn(`Unknown automation action: ${action}`);
  }
}
