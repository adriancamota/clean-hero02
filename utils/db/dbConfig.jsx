import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";  
// Load environment variables
const sql = neon(process.env.DATABASE_URL);  // Use env variable for the DB URL

// Initialize the Drizzle ORM with your schema
export const db = drizzle(sql, {schema});
