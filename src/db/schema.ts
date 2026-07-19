import { pgTable, text, timestamp, boolean, real, json } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  oldPrice: real("old_price"),
  image: text("image").notNull(),
  sizes: text("sizes").array().notNull(),
  colors: text("colors").array().notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey(), // just use a single row id like 'default'
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  logo: text("logo").notNull(),
  showName: boolean("show_name").default(true),
  footerDescription: text("footer_description"),
  footerInfo1: text("footer_info1"),
  footerInfo2: text("footer_info2"),
  bannerActive: boolean("banner_active").default(false),
  bannerText: text("banner_text"),
  bannerImageUrl: text("banner_image_url"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  tiktokUrl: text("tiktok_url"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
