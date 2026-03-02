/**
 * Database seed script.
 * Run with: npx tsx src/lib/db/seed.ts
 */

import dotenv from "dotenv";
import path from "path";

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "./connection";
import User from "./models/user";
import Category from "./models/category";
import Product from "./models/product";
import Table from "./models/table";
import Location from "./models/location";

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB. Seeding...");

  // ── SuperAdmin ──
  const adminExists = await User.findOne({ email: "admin@mangosgrill.com" });
  if (!adminExists) {
    const hash = await bcrypt.hash("Admin123!", 12);
    await User.create({
      firstName: "Admin",
      lastName: "Mango",
      email: "admin@mangosgrill.com",
      password: hash,
      phone: "+1 (713) 555-0100",
      role: "SuperAdmin",
      status: "Active",
    });
    console.log("  ✔ SuperAdmin created");
  } else {
    console.log("  ⏭ SuperAdmin already exists");
  }

  // ── Categories ──
  const categories = [
    { name: { en: "Arepas", es: "Arepas" }, description: { en: "Traditional corn-based flatbreads", es: "Tortillas de maíz tradicionales" }, sortOrder: 1 },
    { name: { en: "Main Courses", es: "Platos Principales" }, description: { en: "Hearty Venezuelan entrees", es: "Platos fuertes venezolanos" }, sortOrder: 2 },
    { name: { en: "Appetizers", es: "Entradas" }, description: { en: "Starters and finger foods", es: "Aperitivos y bocadillos" }, sortOrder: 3 },
    { name: { en: "Desserts", es: "Postres" }, description: { en: "Sweet Venezuelan treats", es: "Dulces venezolanos" }, sortOrder: 4 },
    { name: { en: "Drinks", es: "Bebidas" }, description: { en: "Refreshing beverages", es: "Bebidas refrescantes" }, sortOrder: 5 },
    { name: { en: "Sides", es: "Acompañantes" }, description: { en: "Side dishes and extras", es: "Acompañantes y extras" }, sortOrder: 6 },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { "name.en": cat.name.en },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }
  console.log("  ✔ Categories seeded");

  // Fetch created categories for product refs
  const catDocs = await Category.find().lean();
  const catMap = new Map(catDocs.map((c) => [c.name.en, c._id]));

  // ── Products ──
  const products = [
    { name: { en: "Arepa Reina Pepiada", es: "Arepa Reina Pepiada" }, slug: "arepa-reina-pepiada", description: { en: "Shredded chicken with avocado and mayo", es: "Pollo mechado con aguacate y mayonesa" }, price: 12.99, category: catMap.get("Arepas"), featured: true, tags: ["popular", "gluten-free"], sortOrder: 1 },
    { name: { en: "Arepa Pabellon", es: "Arepa Pabellón" }, slug: "arepa-pabellon", description: { en: "Shredded beef, black beans, plantain and cheese", es: "Carne mechada, caraotas, plátano y queso" }, price: 14.99, category: catMap.get("Arepas"), featured: true, tags: ["popular"], sortOrder: 2 },
    { name: { en: "Pabellon Criollo", es: "Pabellón Criollo" }, slug: "pabellon-criollo", description: { en: "Venezuela's national dish with shredded beef, rice, black beans and plantain", es: "Plato nacional con carne mechada, arroz, caraotas y plátano" }, price: 16.99, category: catMap.get("Main Courses"), featured: true, tags: ["popular", "national-dish"], sortOrder: 1 },
    { name: { en: "Asado Negro", es: "Asado Negro" }, slug: "asado-negro", description: { en: "Slow-braised beef in dark caramel sauce", es: "Carne guisada lentamente en salsa de papelón" }, price: 18.99, category: catMap.get("Main Courses"), featured: true, tags: ["chef-special"], sortOrder: 2 },
    { name: { en: "Cachapa con Queso", es: "Cachapa con Queso" }, slug: "cachapa-con-queso", description: { en: "Sweet corn pancake with hand-stretched cheese", es: "Cachapa de maíz dulce con queso de mano" }, price: 13.99, category: catMap.get("Main Courses"), tags: ["vegetarian"], sortOrder: 3 },
    { name: { en: "Tequeños (6pc)", es: "Tequeños (6 uds)" }, slug: "tequenos-6pc", description: { en: "Crispy fried cheese sticks wrapped in dough", es: "Palitos de queso envueltos y fritos" }, price: 9.99, category: catMap.get("Appetizers"), featured: true, tags: ["popular", "vegetarian"], sortOrder: 1 },
    { name: { en: "Empanadas (3pc)", es: "Empanadas (3 uds)" }, slug: "empanadas-3pc", description: { en: "Crispy cornmeal turnovers with choice of filling", es: "Empanadas crujientes de maíz con relleno a elección" }, price: 11.99, category: catMap.get("Appetizers"), tags: ["gluten-free"], sortOrder: 2 },
    { name: { en: "Tres Leches", es: "Tres Leches" }, slug: "tres-leches", description: { en: "Three-milk soaked sponge cake", es: "Bizcocho bañado en tres leches" }, price: 8.99, category: catMap.get("Desserts"), featured: true, tags: ["popular"], sortOrder: 1 },
    { name: { en: "Quesillo", es: "Quesillo" }, slug: "quesillo", description: { en: "Venezuelan caramel flan", es: "Flan de caramelo venezolano" }, price: 7.99, category: catMap.get("Desserts"), tags: ["gluten-free"], sortOrder: 2 },
    { name: { en: "Papelón con Limón", es: "Papelón con Limón" }, slug: "papelon-con-limon", description: { en: "Traditional sugarcane lemonade", es: "Limonada de papelón tradicional" }, price: 4.99, category: catMap.get("Drinks"), tags: ["refreshing"], sortOrder: 1 },
    { name: { en: "Chicha Venezolana", es: "Chicha Venezolana" }, slug: "chicha-venezolana", description: { en: "Creamy rice drink with cinnamon", es: "Bebida cremosa de arroz con canela" }, price: 5.99, category: catMap.get("Drinks"), tags: ["popular"], sortOrder: 2 },
    { name: { en: "Tostones", es: "Tostones" }, slug: "tostones", description: { en: "Twice-fried green plantain slices", es: "Rodajas de plátano verde fritas dos veces" }, price: 5.99, category: catMap.get("Sides"), tags: ["gluten-free", "vegan"], sortOrder: 1 },
  ];

  for (const prod of products) {
    await Product.findOneAndUpdate(
      { slug: prod.slug },
      { $setOnInsert: { ...prod, status: "Available", ingredients: { en: [], es: [] }, modifiers: [], extras: [] } },
      { upsert: true }
    );
  }
  console.log("  ✔ Products seeded");

  // ── Tables (for interactive map) ──
  const tables = [
    { number: 1, name: "Table 1", capacity: 2, shape: "round", position: { x: 15, y: 25 }, status: "Available" },
    { number: 2, name: "Table 2", capacity: 2, shape: "round", position: { x: 35, y: 25 }, status: "Available" },
    { number: 3, name: "Table 3", capacity: 4, shape: "square", position: { x: 55, y: 25 }, status: "Available" },
    { number: 4, name: "Table 4", capacity: 4, shape: "square", position: { x: 75, y: 25 }, status: "Reserved" },
    { number: 5, name: "Table 5", capacity: 6, shape: "rectangle", position: { x: 15, y: 55 }, status: "Available" },
    { number: 6, name: "Table 6", capacity: 6, shape: "rectangle", position: { x: 40, y: 55 }, status: "Occupied" },
    { number: 7, name: "Table 7", capacity: 4, shape: "square", position: { x: 65, y: 55 }, status: "Available" },
    { number: 8, name: "Table 8", capacity: 2, shape: "round", position: { x: 85, y: 55 }, status: "Available" },
    { number: 9, name: "Table 9", capacity: 8, shape: "rectangle", position: { x: 25, y: 80 }, status: "Available" },
    { number: 10, name: "Table 10", capacity: 4, shape: "square", position: { x: 55, y: 80 }, status: "Available" },
    { number: 11, name: "Table 11", capacity: 2, shape: "round", position: { x: 75, y: 80 }, status: "Available" },
    { number: 12, name: "Table 12", capacity: 10, shape: "rectangle", position: { x: 50, y: 95 }, status: "Available" },
  ];

  for (const table of tables) {
    await Table.findOneAndUpdate(
      { number: table.number },
      { $setOnInsert: table },
      { upsert: true }
    );
  }
  console.log("  ✔ Tables seeded");

  // ── Locations ──
  const locations = [
    {
      name: "Mango's Grill - Montrose",
      slug: "houston-montrose",
      address: { street: "1547 Westheimer Rd", city: "Houston", state: "TX", zip: "77098", country: "US" },
      phone: "(713) 555-0199",
      email: "montrose@mangosgrill.com",
      mapCoordinates: { lat: 29.7425, lng: -95.3988 },
      isFlagship: true,
      status: "Active",
    },
    {
      name: "Mango's Grill - Downtown Austin",
      slug: "austin-downtown",
      address: { street: "812 Congress Ave", city: "Austin", state: "TX", zip: "78701", country: "US" },
      phone: "(512) 555-0234",
      email: "austin@mangosgrill.com",
      mapCoordinates: { lat: 30.2672, lng: -97.7431 },
      isFlagship: false,
      status: "Active",
    },
    {
      name: "Mango's Grill - Deep Ellum",
      slug: "dallas-deep-ellum",
      address: { street: "2845 Elm St", city: "Dallas", state: "TX", zip: "75226", country: "US" },
      phone: "(214) 555-0178",
      email: "dallas@mangosgrill.com",
      mapCoordinates: { lat: 32.7834, lng: -96.7836 },
      isFlagship: false,
      status: "Active",
    },
  ];

  for (const loc of locations) {
    await Location.findOneAndUpdate(
      { slug: loc.slug },
      { $setOnInsert: loc },
      { upsert: true }
    );
  }
  console.log("  ✔ Locations seeded");

  console.log("\n✅ Seed complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
