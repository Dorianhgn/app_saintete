import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "prayer_page_config" ADD COLUMN "chapelet_catechese_title" varchar DEFAULT 'Comment prier le chapelet';
  ALTER TABLE "prayer_page_config" ADD COLUMN "chapelet_catechese_content" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "prayer_page_config" DROP COLUMN "chapelet_catechese_title";
  ALTER TABLE "prayer_page_config" DROP COLUMN "chapelet_catechese_content";`)
}
