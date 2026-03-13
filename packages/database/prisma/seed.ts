import {
  PrismaClient,
  Role,
  Currency,
  ProductStatus,
  AssetType,
  PlaybookStatus,
  TemplateType,
  BusinessModel,
  OrderType,
  OrderStatus,
  Platform,
  ConversationChannel,
  ConversationStatus,
  TaskStatus,
  TaskPriority,
  AppointmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Cleanup (for re-seeding) ──────────────────────────────
  await prisma.workflowLog.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.platformProductReference.deleteMany();
  await prisma.scheduledOrder.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.priceTier.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.template.deleteMany();
  await prisma.playbookSection.deleteMany();
  await prisma.playbook.deleteMany();
  await prisma.competitorBenchmark.deleteMany();
  await prisma.researchNote.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.productCountryAvailability.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.country.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Existing data cleaned");

  // ── Countries ───────────────────────────────────────────
  const colombia = await prisma.country.upsert({
    where: { code: "CO" },
    update: {},
    create: { code: "CO", name: "Colombia", currency: "COP", taxRate: 0.19, active: true },
  });

  const ecuador = await prisma.country.upsert({
    where: { code: "EC" },
    update: {},
    create: { code: "EC", name: "Ecuador", currency: "USD", taxRate: 0.12, active: true },
  });

  console.log("✅ Countries created");

  // ── Categories ──────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "suplementos-nutricionales" },
      update: {},
      create: {
        name: "Suplementos Nutricionales",
        slug: "suplementos-nutricionales",
        description: "Vitaminas, minerales y suplementos alimenticios",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "cuidado-personal" },
      update: {},
      create: {
        name: "Cuidado Personal",
        slug: "cuidado-personal",
        description: "Productos de higiene y cuidado corporal",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "equipos-medicos" },
      update: {},
      create: {
        name: "Equipos Médicos",
        slug: "equipos-medicos",
        description: "Dispositivos y equipos para uso médico",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "bienestar-natural" },
      update: {},
      create: {
        name: "Bienestar Natural",
        slug: "bienestar-natural",
        description: "Productos naturales y orgánicos para la salud",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "fitness-deporte" },
      update: {},
      create: {
        name: "Fitness y Deporte",
        slug: "fitness-deporte",
        description: "Productos para rendimiento deportivo y fitness",
        sortOrder: 5,
      },
    }),
  ]);

  console.log("✅ Categories created");

  // ── Users ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@saludprolab.com" },
      update: {},
      create: {
        email: "admin@saludprolab.com",
        name: "Carlos Admin",
        passwordHash,
        role: "SUPER_ADMIN",
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@saludprolab.com" },
      update: {},
      create: {
        email: "manager@saludprolab.com",
        name: "María Gestora",
        passwordHash: await bcrypt.hash("Manager123!", 12),
        role: "ADMIN",
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "analista@saludprolab.com" },
      update: {},
      create: {
        email: "analista@saludprolab.com",
        name: "Pedro Analista",
        passwordHash: await bcrypt.hash("Analyst123!", 12),
        role: "ANALYST",
        active: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "tienda@ejemplo.com" },
      update: {},
      create: {
        email: "tienda@ejemplo.com",
        name: "Laura Dropshipper",
        passwordHash: await bcrypt.hash("Drop123!", 12),
        role: "DROPSHIPPER",
        active: true,
      },
    }),
  ]);

  console.log("✅ Users created");

  // ── Supplier ────────────────────────────────────────────
  const supplier = await prisma.supplier.upsert({
    where: { slug: "laboratorios-vitasalud" },
    update: {},
    create: {
      name: "Laboratorios VitaSalud",
      slug: "laboratorios-vitasalud",
      contactName: "Roberto Méndez",
      email: "contacto@vitasalud.com",
      phone: "+57 1 234 5678",
      website: "https://vitasalud.com",
      country: "CO",
      notes: "Proveedor principal de suplementos. Certificación GMP.",
      active: true,
    },
  });

  console.log("✅ Supplier created");

  // ── Products ────────────────────────────────────────────
  const productsData = [
    {
      name: "Colágeno Hidrolizado Premium",
      slug: "colageno-hidrolizado-premium",
      description:
        "Colágeno hidrolizado tipo I y III de origen bovino. Contribuye a la salud de piel, cabello, uñas y articulaciones. Fórmula enriquecida con vitamina C para mejor absorción.",
      shortDesc: "Colágeno tipo I y III con vitamina C para piel y articulaciones",
      sku: "SP-COL-001",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[0].id,
      basePrice: 12.5,
      baseCurrency: "USD" as Currency,
      weight: 0.35,
      tags: ["colágeno", "piel", "articulaciones", "vitamina-c"],
      metaTitle: "Colágeno Hidrolizado Premium - Salud ProLab",
      faqs: JSON.stringify([
        {
          q: "¿Cuánto tiempo tarda en verse resultados?",
          a: "Generalmente entre 4-8 semanas de uso continuo.",
        },
        { q: "¿Tiene sabor?", a: "Disponible en sabor neutro y frutos rojos." },
      ]),
    },
    {
      name: "Omega 3 Ultra Concentrado",
      slug: "omega-3-ultra-concentrado",
      description:
        "Aceite de pescado ultra concentrado con EPA y DHA. Apoya la salud cardiovascular, cerebral y articular. Cápsulas blandas de fácil digestión.",
      shortDesc: "EPA + DHA concentrado para salud cardiovascular y cerebral",
      sku: "SP-OMG-002",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[0].id,
      basePrice: 18.0,
      baseCurrency: "USD" as Currency,
      weight: 0.25,
      tags: ["omega-3", "cardiovascular", "cerebral", "EPA", "DHA"],
      metaTitle: "Omega 3 Ultra Concentrado - Salud ProLab",
    },
    {
      name: "Proteína Whey Isolate",
      slug: "proteina-whey-isolate",
      description:
        "Proteína de suero de leche aislada con 90% de pureza. 25g de proteína por porción. Ideal para recuperación muscular post-entrenamiento.",
      shortDesc: "Whey Isolate 90% pureza, 25g proteína por porción",
      sku: "SP-PRO-003",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[4].id,
      basePrice: 35.0,
      baseCurrency: "USD" as Currency,
      weight: 1.0,
      tags: ["proteína", "whey", "fitness", "músculo"],
      metaTitle: "Proteína Whey Isolate - Salud ProLab",
    },
    {
      name: "Kit Tensiómetro Digital",
      slug: "kit-tensiometro-digital",
      description:
        "Tensiómetro digital de brazo con pantalla LCD grande. Memoria para 120 lecturas. Incluye brazalete ajustable y estuche de transporte.",
      shortDesc: "Tensiómetro digital LCD con memoria 120 lecturas",
      sku: "SP-TEN-004",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[2].id,
      basePrice: 28.0,
      baseCurrency: "USD" as Currency,
      weight: 0.4,
      tags: ["tensiómetro", "presión", "digital", "equipo-médico"],
      metaTitle: "Kit Tensiómetro Digital - Salud ProLab",
    },
    {
      name: "Crema Facial Ácido Hialurónico",
      slug: "crema-facial-acido-hialuronico",
      description:
        "Crema hidratante facial con ácido hialurónico de triple peso molecular. Hidratación profunda, reduce líneas de expresión. Sin parabenos.",
      shortDesc: "Hidratante facial con ácido hialurónico triple acción",
      sku: "SP-CRE-005",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[1].id,
      basePrice: 15.0,
      baseCurrency: "USD" as Currency,
      weight: 0.08,
      tags: ["facial", "ácido-hialurónico", "hidratante", "anti-edad"],
      metaTitle: "Crema Facial Ácido Hialurónico - Salud ProLab",
    },
    {
      name: "Aceite Esencial de Lavanda Orgánico",
      slug: "aceite-esencial-lavanda-organico",
      description:
        "Aceite esencial 100% puro de lavanda orgánica. Para aromaterapia, masajes y cuidado de la piel. Certificación orgánica USDA.",
      shortDesc: "Aceite esencial de lavanda 100% orgánico certificado",
      sku: "SP-ACE-006",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[3].id,
      basePrice: 9.5,
      baseCurrency: "USD" as Currency,
      weight: 0.05,
      tags: ["aceite-esencial", "lavanda", "orgánico", "aromaterapia"],
      metaTitle: "Aceite Esencial Lavanda Orgánico - Salud ProLab",
    },
    {
      name: "Magnesio + Zinc + B6",
      slug: "magnesio-zinc-b6",
      description:
        "Fórmula sinérgica de magnesio bisglicinato, zinc picolinato y vitamina B6. Apoya el sueño, la recuperación muscular y el sistema inmune.",
      shortDesc: "Magnesio + Zinc + B6 para sueño y recuperación",
      sku: "SP-MAG-007",
      status: "DRAFT" as ProductStatus,
      categoryId: categories[0].id,
      basePrice: 14.0,
      baseCurrency: "USD" as Currency,
      weight: 0.2,
      tags: ["magnesio", "zinc", "vitamina-b6", "sueño", "inmune"],
      metaTitle: "Magnesio + Zinc + B6 - Salud ProLab",
    },
    {
      name: "Banda de Resistencia Set Pro",
      slug: "banda-resistencia-set-pro",
      description:
        "Set de 5 bandas de resistencia de látex natural con diferentes niveles. Incluye anclaje de puerta, manijas acolchadas y tobilleras. Bolsa de transporte.",
      shortDesc: "Set 5 bandas de resistencia con accesorios completos",
      sku: "SP-BAN-008",
      status: "ACTIVE" as ProductStatus,
      categoryId: categories[4].id,
      basePrice: 22.0,
      baseCurrency: "USD" as Currency,
      weight: 0.6,
      tags: ["bandas", "resistencia", "fitness", "entrenamiento"],
      metaTitle: "Banda de Resistencia Set Pro - Salud ProLab",
    },
  ];

  const products = [];
  for (const data of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: { ...data, supplierId: supplier.id },
    });
    products.push(product);
  }

  console.log("✅ Products created");

  // ── Variants ────────────────────────────────────────────
  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      {
        productId: products[0].id,
        name: "Sabor Neutro 300g",
        sku: "SP-COL-001-NEU",
        price: 12.5,
        stock: 150,
        attributes: JSON.stringify({ sabor: "neutro", peso: "300g" }),
      },
      {
        productId: products[0].id,
        name: "Frutos Rojos 300g",
        sku: "SP-COL-001-FR",
        price: 13.0,
        stock: 100,
        attributes: JSON.stringify({ sabor: "frutos rojos", peso: "300g" }),
      },
      {
        productId: products[0].id,
        name: "Sabor Neutro 500g",
        sku: "SP-COL-001-NEU5",
        price: 19.5,
        stock: 80,
        attributes: JSON.stringify({ sabor: "neutro", peso: "500g" }),
      },
      {
        productId: products[2].id,
        name: "Chocolate 1kg",
        sku: "SP-PRO-003-CHO",
        price: 35.0,
        stock: 60,
        attributes: JSON.stringify({ sabor: "chocolate", peso: "1kg" }),
      },
      {
        productId: products[2].id,
        name: "Vainilla 1kg",
        sku: "SP-PRO-003-VAN",
        price: 35.0,
        stock: 45,
        attributes: JSON.stringify({ sabor: "vainilla", peso: "1kg" }),
      },
      {
        productId: products[2].id,
        name: "Sin Sabor 2kg",
        sku: "SP-PRO-003-SS2",
        price: 62.0,
        stock: 30,
        attributes: JSON.stringify({ sabor: "sin sabor", peso: "2kg" }),
      },
      {
        productId: products[7].id,
        name: "Nivel Básico (3 bandas)",
        sku: "SP-BAN-008-BAS",
        price: 15.0,
        stock: 200,
        attributes: JSON.stringify({ nivel: "básico", cantidad: "3" }),
      },
      {
        productId: products[7].id,
        name: "Nivel Pro (5 bandas)",
        sku: "SP-BAN-008-PRO",
        price: 22.0,
        stock: 120,
        attributes: JSON.stringify({ nivel: "pro", cantidad: "5" }),
      },
    ],
  });

  console.log("✅ Variants created");

  // ── Country Availability ────────────────────────────────
  for (const product of products) {
    await prisma.productCountryAvailability.upsert({
      where: { productId_countryId: { productId: product.id, countryId: colombia.id } },
      update: {},
      create: {
        productId: product.id,
        countryId: colombia.id,
        available: true,
        localPrice: product.basePrice * 4200,
        localCurrency: "COP",
      },
    });

    if (product.status === "ACTIVE") {
      await prisma.productCountryAvailability.upsert({
        where: { productId_countryId: { productId: product.id, countryId: ecuador.id } },
        update: {},
        create: {
          productId: product.id,
          countryId: ecuador.id,
          available: true,
          localPrice: product.basePrice,
          localCurrency: "USD",
        },
      });
    }
  }

  console.log("✅ Country availability created");

  // ── Assets (dummy) ──────────────────────────────────────
  for (const product of products) {
    await prisma.asset.create({
      data: {
        productId: product.id,
        type: "IMAGE",
        url: `/placeholder/${product.slug}.jpg`,
        key: `products/${product.slug}/main.jpg`,
        filename: `${product.slug}-main.jpg`,
        mimeType: "image/jpeg",
        size: 150000,
        alt: product.name,
        sortOrder: 0,
      },
    });
  }

  console.log("✅ Assets created");

  // ── Research Notes ──────────────────────────────────────
  const note1 = await prisma.researchNote.create({
    data: {
      productId: products[0].id,
      title: "Análisis de Mercado: Colágeno Hidrolizado en Colombia",
      content: `## Resumen del Mercado\n\nEl mercado de colágeno hidrolizado en Colombia ha crecido un 25% en los últimos 2 años. Los principales canales de venta son:\n\n1. **Tiendas naturistas** - 40% del mercado\n2. **E-commerce** - 35% y creciendo\n3. **Farmacias** - 25%\n\n## Perfil del Consumidor\n- Mujeres 25-45 años (70%)\n- NSE medio-alto\n- Interesadas en anti-aging y bienestar articular\n\n## Oportunidades\n- Diferenciación por certificaciones (GMP, orgánico)\n- Sabores innovadores (matcha, açaí)\n- Presentaciones individuales (sachets)`,
      source: "Euromonitor + investigación propia",
      tags: ["colágeno", "colombia", "mercado", "tendencias"],
    },
  });

  await prisma.competitorBenchmark.createMany({
    data: [
      {
        researchNoteId: note1.id,
        competitor: "NaturVida Colágeno",
        url: "https://naturvida.com.co/colageno",
        price: 52500,
        currency: "COP",
        rating: 4.2,
        reviewCount: 1250,
        pros: ["Buena distribución", "Marca conocida", "Precio accesible"],
        cons: ["Sin vitamina C", "Solo un sabor", "Envase básico"],
        notes: "Líder actual del mercado. Oportunidad de superarlos en formulación.",
      },
      {
        researchNoteId: note1.id,
        competitor: "VitalCol Premium",
        url: "https://vitalcol.co",
        price: 89000,
        currency: "COP",
        rating: 4.6,
        reviewCount: 430,
        pros: ["Fórmula completa", "Buen packaging", "Múltiples sabores"],
        cons: ["Precio alto", "Poca distribución", "Stock irregular"],
        notes: "Competidor premium. Nuestro target de posicionamiento.",
      },
    ],
  });

  const note2 = await prisma.researchNote.create({
    data: {
      productId: products[1].id,
      title: "Tendencias Omega 3 - Mercado Ecuador 2024",
      content: `## Estado del Mercado\n\nEcuador muestra una adopción creciente de Omega 3, especialmente en:\n- Quito y Guayaquil (mercados principales)\n- Segmento 30-55 años\n\n## Regulación\n- Registro sanitario ARCSA requerido\n- Importación: partida arancelaria específica para suplementos\n\n## Precios de Referencia\n- Rango retail: $15-35 USD\n- Margen distribuidor: 30-40%`,
      source: "ARCSA + análisis de mercado local",
      tags: ["omega-3", "ecuador", "regulación", "precios"],
    },
  });

  await prisma.competitorBenchmark.create({
    data: {
      researchNoteId: note2.id,
      competitor: "OmegaLab EC",
      url: "https://omegalab.ec",
      price: 24.5,
      currency: "USD",
      rating: 4.0,
      reviewCount: 180,
      pros: ["Registro ARCSA", "Distribución en farmacias"],
      cons: ["Concentración baja de EPA/DHA", "Sin certificación internacional"],
    },
  });

  const note3 = await prisma.researchNote.create({
    data: {
      title: "Investigación General: Tendencias E-commerce Salud LATAM",
      content: `## Macro Tendencias\n\n1. **Social Commerce**: 60% de compradores descubren productos en redes sociales\n2. **WhatsApp Commerce**: Canal de venta creciente en Colombia y Ecuador\n3. **Suscripciones**: Modelo de recurrencia en suplementos\n4. **Live Shopping**: En crecimiento para productos de salud\n\n## Plataformas Principales\n- Mercado Libre (ambos países)\n- Rappi (Colombia principalmente)\n- Shopify stores (creciente)\n\n## Recomendaciones\n- Implementar chatbot de WhatsApp\n- Crear contenido educativo\n- Programa de referidos`,
      source: "Statista + Americas Market Intelligence",
      tags: ["e-commerce", "latam", "tendencias", "social-commerce"],
    },
  });

  console.log("✅ Research notes created");

  // ── Playbooks ───────────────────────────────────────────
  const playbook1 = await prisma.playbook.create({
    data: {
      title: "Lanzamiento Colágeno Premium Colombia",
      slug: "lanzamiento-colageno-premium-co",
      description:
        "Playbook completo para el lanzamiento del Colágeno Hidrolizado Premium en el mercado colombiano",
      status: "PUBLISHED",
      tags: ["lanzamiento", "colágeno", "colombia"],
      sections: {
        create: [
          {
            phase: "ESTRATEGIA",
            title: "Estrategia de Lanzamiento",
            content:
              "## Objetivo\nPosicionar el Colágeno Hidrolizado Premium como la opción premium-accesible en Colombia.\n\n## Meta\n- 500 unidades vendidas en primer mes\n- 100 reseñas positivas en 60 días\n- Presencia en 3 marketplaces\n\n## Diferenciador\nÚnico colágeno con vitamina C + doble sabor a precio competitivo.",
            sortOrder: 0,
          },
          {
            phase: "SEGMENTOS",
            title: "Segmentación de Mercado",
            content:
              "## Segmento Primario\n**Mujer urbana 28-42 años**\n- NSE medio-alto\n- Interesada en bienestar y anti-aging\n- Activa en Instagram y TikTok\n- Compra online con frecuencia\n\n## Segmento Secundario\n**Deportistas 25-50 años**\n- Buscan recuperación articular\n- Comparan ingredientes\n- Valoran certificaciones",
            sortOrder: 1,
          },
          {
            phase: "FUNNEL",
            title: "Embudo de Conversión",
            content:
              "## Awareness\n- Influencer marketing (micro-influencers salud)\n- Content marketing en Instagram/TikTok\n- Google Ads (keywords: colágeno hidrolizado)\n\n## Consideración\n- Landing page educativa\n- Comparativa vs competencia\n- Testimonios reales\n\n## Conversión\n- Oferta de lanzamiento 15% OFF\n- Bundle colágeno + shaker\n- Garantía de satisfacción 30 días",
            sortOrder: 2,
          },
          {
            phase: "EJECUCION",
            title: "Plan de Ejecución",
            content:
              "## Semana 1-2: Pre-lanzamiento\n- Teaser en redes sociales\n- Lista de espera con descuento\n- Envío a influencers\n\n## Semana 3-4: Lanzamiento\n- Activación de campañas pagadas\n- Live shopping en Instagram\n- Email marketing a base existente\n\n## Semana 5-8: Optimización\n- Retargeting a visitantes\n- UGC (User Generated Content)\n- Reviews en marketplaces",
            sortOrder: 3,
          },
          {
            phase: "RECURSOS",
            title: "Recursos Necesarios",
            content:
              "## Presupuesto\n- Influencers: $500 USD\n- Ads (Meta + Google): $1,000 USD/mes\n- Contenido: $300 USD\n- Muestras: $200 USD\n\n## Equipo\n- Community Manager (medio tiempo)\n- Diseñador gráfico (freelance)\n- Copywriter\n\n## Herramientas\n- Canva Pro\n- Meta Business Suite\n- Google Analytics 4",
            sortOrder: 4,
          },
          {
            phase: "ANALISIS",
            title: "Métricas y Análisis",
            content:
              "## KPIs Principales\n- **ROAS**: Meta >3x\n- **CPA**: <$8 USD\n- **Tasa de conversión**: >2.5%\n- **LTV/CAC ratio**: >3\n\n## Seguimiento\n- Dashboard semanal\n- Reunión quincenal de resultados\n- Ajuste de presupuesto mensual\n\n## Herramientas de Medición\n- Google Analytics 4\n- Meta Ads Manager\n- Hotjar (heatmaps landing)",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  const playbook2 = await prisma.playbook.create({
    data: {
      title: "Estrategia WhatsApp Commerce",
      slug: "estrategia-whatsapp-commerce",
      description: "Playbook para implementar ventas por WhatsApp Business",
      status: "DRAFT",
      tags: ["whatsapp", "ventas", "automatización"],
      sections: {
        create: [
          {
            phase: "ESTRATEGIA",
            title: "Estrategia WhatsApp",
            content:
              "## Objetivo\nImplementar canal de ventas vía WhatsApp Business API.\n\n## Alcance\n- Catálogo de productos en WhatsApp\n- Atención al cliente automatizada\n- Seguimiento post-venta",
            sortOrder: 0,
          },
          {
            phase: "SEGMENTOS",
            title: "Audiencia WhatsApp",
            content:
              "## Target\n- Clientes existentes para recompra\n- Leads de redes sociales\n- Referidos de clientes actuales",
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Playbooks created");

  // ── Templates ───────────────────────────────────────────
  await prisma.template.createMany({
    skipDuplicates: true,
    data: [
      {
        name: "Email de Bienvenida",
        slug: "email-bienvenida",
        type: "EMAIL",
        subject: "¡Bienvenido a {{brand}}! Tu acceso está listo",
        body: "Hola {{nombre}},\n\n¡Bienvenido a {{brand}}! Tu cuenta de {{rol}} ha sido creada exitosamente.\n\nAccede a la plataforma aquí: {{url}}\n\nTu usuario: {{email}}\n\nSi tienes alguna pregunta, no dudes en contactarnos.\n\n¡Éxitos en tus ventas!\nEl equipo de {{brand}}",
        variables: ["nombre", "brand", "rol", "url", "email"],
        tags: ["onboarding", "bienvenida"],
      },
      {
        name: "Post Lanzamiento de Producto",
        slug: "post-lanzamiento-producto",
        type: "SOCIAL",
        subject: "",
        body: "🚀 ¡NUEVO PRODUCTO!\n\n{{nombre_producto}}\n\n{{descripcion_corta}}\n\n✅ {{beneficio_1}}\n✅ {{beneficio_2}}\n✅ {{beneficio_3}}\n\n💰 Precio especial de lanzamiento: {{precio}}\n🔗 Link en bio\n\n#SaludProLab #{{hashtag_1}} #{{hashtag_2}}",
        variables: [
          "nombre_producto",
          "descripcion_corta",
          "beneficio_1",
          "beneficio_2",
          "beneficio_3",
          "precio",
          "hashtag_1",
          "hashtag_2",
        ],
        tags: ["lanzamiento", "social-media", "producto"],
      },
      {
        name: "Mensaje WhatsApp Seguimiento",
        slug: "whatsapp-seguimiento",
        type: "WHATSAPP",
        subject: "",
        body: "Hola {{nombre}} 👋\n\nSoy {{agente}} de {{brand}}.\n\n¿Qué tal te ha ido con tu {{producto}}? Queremos asegurarnos de que estés satisfecho/a.\n\nSi necesitas algo, ¡estamos aquí para ayudarte! 💚\n\n¿Te gustaría conocer nuestras novedades?",
        variables: ["nombre", "agente", "brand", "producto"],
        tags: ["whatsapp", "seguimiento", "post-venta"],
      },
      {
        name: "Landing Page Producto",
        slug: "landing-page-producto",
        type: "LANDING",
        subject: "{{titulo_pagina}}",
        body: '# {{nombre_producto}}\n\n## {{subtitulo}}\n\n{{descripcion}}\n\n### Beneficios\n- {{beneficio_1}}\n- {{beneficio_2}}\n- {{beneficio_3}}\n\n### Lo que dicen nuestros clientes\n"{{testimonio}}" - {{nombre_cliente}}\n\n### Precio\n{{precio}} | {{descuento}} de descuento\n\n[COMPRAR AHORA]({{url_compra}})',
        variables: [
          "nombre_producto",
          "subtitulo",
          "descripcion",
          "beneficio_1",
          "beneficio_2",
          "beneficio_3",
          "testimonio",
          "nombre_cliente",
          "precio",
          "descuento",
          "url_compra",
          "titulo_pagina",
        ],
        tags: ["landing", "ventas", "producto"],
      },
    ],
  });

  console.log("✅ Templates created");

  // ── Collections ─────────────────────────────────────────
  const collection = await prisma.collection.create({
    data: {
      userId: users[3].id,
      name: "Mis Favoritos para Tienda",
      description: "Productos seleccionados para mi tienda online",
      isPublic: false,
      items: {
        create: [
          { productId: products[0].id, notes: "Bestseller potencial", sortOrder: 0 },
          { productId: products[4].id, notes: "Buen margen", sortOrder: 1 },
          { productId: products[7].id, notes: "Trending en fitness", sortOrder: 2 },
        ],
      },
    },
  });

  console.log("✅ Collections created");

  // ── Update Products with Business Model Fields ────────────
  await prisma.product.update({
    where: { id: products[0].id },
    data: {
      businessModel: "DROPSHIPPING",
      isProgrammableDropshipping: true,
      subscriptionAllowed: true,
    },
  });
  await prisma.product.update({
    where: { id: products[1].id },
    data: {
      businessModel: "DROPSHIPPING",
      isProgrammableDropshipping: true,
      subscriptionAllowed: false,
    },
  });
  await prisma.product.update({
    where: { id: products[2].id },
    data: {
      businessModel: "HIBRIDO",
      minimumOrderQuantity: 10,
      minimumInvestment: 350,
      productionTimeDays: 15,
      isProgrammableDropshipping: true,
      subscriptionAllowed: true,
    },
  });
  await prisma.product.update({
    where: { id: products[3].id },
    data: {
      businessModel: "MAQUILA",
      minimumOrderQuantity: 50,
      minimumInvestment: 1400,
      productionTimeDays: 30,
    },
  });
  await prisma.product.update({
    where: { id: products[4].id },
    data: {
      businessModel: "DROPSHIPPING",
      isProgrammableDropshipping: false,
      subscriptionAllowed: true,
    },
  });
  await prisma.product.update({
    where: { id: products[5].id },
    data: { businessModel: "DROPSHIPPING" },
  });
  await prisma.product.update({
    where: { id: products[6].id },
    data: {
      businessModel: "MAQUILA",
      minimumOrderQuantity: 100,
      minimumInvestment: 1400,
      productionTimeDays: 21,
    },
  });
  await prisma.product.update({
    where: { id: products[7].id },
    data: { businessModel: "DROPSHIPPING", isProgrammableDropshipping: true },
  });

  console.log("✅ Business model fields updated");

  // ── Distributors ──────────────────────────────────────────
  const distributor1 = await prisma.distributor.create({
    data: {
      companyName: "NaturaTienda CO",
      taxId: "900123456-1",
      phone: "+57 310 555 1234",
      address: "Cra 15 #82-31 Of 402",
      city: "Bogotá",
      country: "CO",
      notes: "Tienda online de productos naturales. Buen volumen de ventas.",
      userId: users[3].id,
    },
  });

  const distributor2 = await prisma.distributor.create({
    data: {
      companyName: "SaludEC Store",
      taxId: "1792456780001",
      phone: "+593 99 888 7654",
      address: "Av. República E7-123",
      city: "Quito",
      country: "EC",
      notes: "Distribuidor en Ecuador. Enfoque en suplementos.",
      userId: users[3].id,
    },
  });

  console.log("✅ Distributors created");

  // ── Price Tiers ───────────────────────────────────────────
  await prisma.priceTier.createMany({
    data: [
      // Colágeno - Colombia
      {
        productId: products[0].id,
        countryId: colombia.id,
        minQuantity: 1,
        maxQuantity: 9,
        costPrice: 12.5,
        suggestedRetail: 25.0,
      },
      {
        productId: products[0].id,
        countryId: colombia.id,
        minQuantity: 10,
        maxQuantity: 49,
        costPrice: 10.5,
        suggestedRetail: 23.0,
      },
      {
        productId: products[0].id,
        countryId: colombia.id,
        minQuantity: 50,
        maxQuantity: null,
        costPrice: 8.5,
        suggestedRetail: 20.0,
      },
      // Colágeno - Ecuador
      {
        productId: products[0].id,
        countryId: ecuador.id,
        minQuantity: 1,
        maxQuantity: 9,
        costPrice: 13.0,
        suggestedRetail: 26.0,
      },
      {
        productId: products[0].id,
        countryId: ecuador.id,
        minQuantity: 10,
        maxQuantity: null,
        costPrice: 11.0,
        suggestedRetail: 22.0,
      },
      // Omega 3
      {
        productId: products[1].id,
        countryId: colombia.id,
        minQuantity: 1,
        maxQuantity: 19,
        costPrice: 18.0,
        suggestedRetail: 35.0,
      },
      {
        productId: products[1].id,
        countryId: colombia.id,
        minQuantity: 20,
        maxQuantity: null,
        costPrice: 14.5,
        suggestedRetail: 30.0,
      },
      // Proteína
      {
        productId: products[2].id,
        countryId: colombia.id,
        minQuantity: 1,
        maxQuantity: 4,
        costPrice: 35.0,
        suggestedRetail: 65.0,
      },
      {
        productId: products[2].id,
        countryId: colombia.id,
        minQuantity: 5,
        maxQuantity: null,
        costPrice: 28.0,
        suggestedRetail: 55.0,
      },
      // Crema Facial
      {
        productId: products[4].id,
        countryId: colombia.id,
        minQuantity: 1,
        maxQuantity: 24,
        costPrice: 15.0,
        suggestedRetail: 30.0,
      },
      {
        productId: products[4].id,
        countryId: colombia.id,
        minQuantity: 25,
        maxQuantity: null,
        costPrice: 11.0,
        suggestedRetail: 25.0,
      },
    ],
  });

  console.log("✅ Price tiers created");

  // ── Orders ────────────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-0001",
      distributorId: distributor1.id,
      type: "DROPSHIPPING_INMEDIATO",
      status: "CONFIRMADO",
      subtotal: 75.0,
      tax: 14.25,
      total: 89.25,
      shippingAddress: "Cll 100 #15-20, Bogotá",
      notes: "Primer pedido de prueba",
      items: {
        create: [
          {
            productId: products[0].id,
            variantInfo: "Sabor Neutro 300g",
            quantity: 3,
            unitPrice: 12.5,
            totalPrice: 37.5,
          },
          { productId: products[4].id, quantity: 2, unitPrice: 15.0, totalPrice: 30.0 },
          { productId: products[5].id, quantity: 1, unitPrice: 9.5, totalPrice: 9.5 },
        ],
      },
      statusHistory: {
        create: [
          { status: "PENDIENTE", notes: "Pedido creado" },
          { status: "CONFIRMADO", notes: "Confirmado por admin" },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-0002",
      distributorId: distributor1.id,
      type: "MAQUILA_PRODUCCION",
      status: "EN_PRODUCCION",
      subtotal: 1400.0,
      tax: 266.0,
      total: 1666.0,
      shippingAddress: "Cra 15 #82-31 Of 402, Bogotá",
      notes: "Pedido maquila - marca propia NaturaTienda",
      items: {
        create: [
          {
            productId: products[2].id,
            variantInfo: "Chocolate 1kg - Etiqueta personalizada",
            quantity: 40,
            unitPrice: 35.0,
            totalPrice: 1400.0,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: "PENDIENTE", notes: "Pedido de maquila creado" },
          { status: "CONFIRMADO", notes: "Aprobado para producción" },
          { status: "EN_PRODUCCION", notes: "En línea de producción, estimado 15 días" },
        ],
      },
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2024-0003",
      distributorId: distributor2.id,
      type: "DROPSHIPPING_INMEDIATO",
      status: "ENVIADO",
      subtotal: 54.0,
      tax: 6.48,
      total: 60.48,
      trackingNumber: "EC-TRACK-20240301",
      shippingAddress: "Av. República E7-123, Quito, Ecuador",
      items: {
        create: [{ productId: products[1].id, quantity: 3, unitPrice: 18.0, totalPrice: 54.0 }],
      },
      statusHistory: {
        create: [
          { status: "PENDIENTE" },
          { status: "CONFIRMADO" },
          { status: "ENVIADO", notes: "Enviado via Servientrega Internacional" },
        ],
      },
    },
  });

  console.log("✅ Orders created");

  // ── Scheduled Orders ──────────────────────────────────────
  await prisma.scheduledOrder.create({
    data: {
      distributorId: distributor1.id,
      productId: products[0].id,
      frequency: "monthly",
      quantity: 30,
      nextDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      active: true,
      notes: "Reposición mensual de colágeno",
    },
  });

  await prisma.scheduledOrder.create({
    data: {
      distributorId: distributor1.id,
      productId: products[7].id,
      frequency: "biweekly",
      quantity: 20,
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      active: true,
      notes: "Bandas de resistencia - alta rotación",
    },
  });

  console.log("✅ Scheduled orders created");

  // ── Platform Product References ───────────────────────────
  await prisma.platformProductReference.createMany({
    data: [
      {
        productId: products[0].id,
        distributorId: distributor1.id,
        platformName: "DROPI",
        platformProductId: "DRP-COL-8821",
        syncEnabled: true,
      },
      {
        productId: products[0].id,
        distributorId: distributor1.id,
        platformName: "SHOPIFY",
        platformProductId: "7654321098765",
        platformVariantId: "43210987654321",
        syncEnabled: true,
      },
      {
        productId: products[1].id,
        distributorId: distributor1.id,
        platformName: "DROPI",
        platformProductId: "DRP-OMG-3344",
        syncEnabled: true,
      },
      {
        productId: products[4].id,
        distributorId: distributor1.id,
        platformName: "EFFI",
        platformProductId: "EFFI-CRM-5501",
        syncEnabled: false,
      },
      {
        productId: products[7].id,
        distributorId: distributor1.id,
        platformName: "HOKO",
        platformProductId: "HK-BAN-9012",
        syncEnabled: true,
      },
      {
        productId: products[0].id,
        distributorId: distributor2.id,
        platformName: "MASTERSHOP",
        platformProductId: "MS-COL-EC-001",
        syncEnabled: true,
      },
    ],
  });

  console.log("✅ Platform references created");

  // ── Tags ──────────────────────────────────────────────────
  await prisma.tag.createMany({
    skipDuplicates: true,
    data: [
      { name: "VIP", slug: "vip", color: "#EAB308" },
      { name: "Nuevo", slug: "nuevo", color: "#22C55E" },
      { name: "Urgente", slug: "urgente", color: "#EF4444" },
      { name: "Seguimiento", slug: "seguimiento", color: "#3B82F6" },
      { name: "Potencial", slug: "potencial", color: "#8B5CF6" },
    ],
  });

  console.log("✅ Tags created");

  // ── Tasks ─────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      {
        title: "Revisar inventario colágeno",
        description: "Verificar stock disponible y programar reposición si es necesario",
        status: "PENDIENTE",
        priority: "ALTA",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignedToId: users[1].id,
        createdById: users[0].id,
      },
      {
        title: "Preparar reporte mensual de ventas",
        description: "Consolidar datos de ventas del mes para presentación",
        status: "EN_PROGRESO",
        priority: "MEDIA",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedToId: users[2].id,
        createdById: users[0].id,
      },
      {
        title: "Contactar nuevo proveedor Ecuador",
        description: "Enviar propuesta de distribución a potencial proveedor en Guayaquil",
        status: "PENDIENTE",
        priority: "MEDIA",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignedToId: users[0].id,
        createdById: users[0].id,
      },
      {
        title: "Actualizar precios Q2",
        status: "COMPLETADA",
        priority: "ALTA",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignedToId: users[1].id,
        createdById: users[0].id,
      },
    ],
  });

  console.log("✅ Tasks created");

  // ── Appointments ──────────────────────────────────────────
  await prisma.appointment.createMany({
    data: [
      {
        title: "Reunión con NaturaTienda CO",
        description: "Revisión trimestral de desempeño y nuevas oportunidades",
        status: "PROGRAMADA",
        startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        location: "Oficina Bogotá",
        assignedToId: users[0].id,
        createdById: users[0].id,
      },
      {
        title: "Demo producto proteína whey",
        description: "Presentación de nueva línea de proteínas para distribuidores",
        status: "CONFIRMADA",
        startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        location: "Google Meet",
        assignedToId: users[1].id,
        createdById: users[0].id,
      },
    ],
  });

  console.log("✅ Appointments created");

  // ── Workspace ─────────────────────────────────────────────
  await prisma.workspace.create({
    data: {
      name: "Salud ProLab Principal",
      slug: "salud-prolab-principal",
      ownerId: users[0].id,
    },
  });

  console.log("✅ Workspace created");

  // ── Audit Logs ──────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        userId: users[0].id,
        action: "CREATE",
        entity: "Product",
        entityId: products[0].id,
        details: JSON.stringify({ name: products[0].name }),
      },
      {
        userId: users[0].id,
        action: "CREATE",
        entity: "Product",
        entityId: products[1].id,
        details: JSON.stringify({ name: products[1].name }),
      },
      {
        userId: users[1].id,
        action: "UPDATE",
        entity: "Product",
        entityId: products[0].id,
        details: JSON.stringify({ field: "status", from: "DRAFT", to: "ACTIVE" }),
      },
      {
        userId: users[2].id,
        action: "CREATE",
        entity: "ResearchNote",
        entityId: note1.id,
        details: JSON.stringify({ title: note1.title }),
      },
      {
        userId: users[0].id,
        action: "CREATE",
        entity: "Playbook",
        entityId: playbook1.id,
        details: JSON.stringify({ title: playbook1.title }),
      },
    ],
  });

  console.log("✅ Audit logs created");
  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login credentials:");
  console.log("  SUPER_ADMIN: admin@saludprolab.com / Admin123!");
  console.log("  ADMIN:       manager@saludprolab.com / Manager123!");
  console.log("  ANALYST:     analista@saludprolab.com / Analyst123!");
  console.log("  DROPSHIPPER: tienda@ejemplo.com / Drop123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
