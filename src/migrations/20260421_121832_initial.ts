import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_godchildren_theme_color" AS ENUM('violet', 'blanc', 'vert', 'rouge', 'or');
  CREATE TYPE "public"."enum_mysteries_days" AS ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche');
  CREATE TYPE "public"."enum_mysteries_mystery_type" AS ENUM('joyeux', 'douloureux', 'glorieux', 'lumineux');
  CREATE TYPE "public"."enum_briques_type" AS ENUM('text', 'audio');
  CREATE TYPE "public"."enum_feedback_reaction" AS ENUM('pray', 'love', 'cross');
  CREATE TABLE "godchildren_allowed_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source_key" varchar NOT NULL
  );
  
  CREATE TABLE "godchildren" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"token" varchar,
  	"patron_saint_id" integer,
  	"theme_color" "enum_godchildren_theme_color" DEFAULT 'violet',
  	"active" boolean DEFAULT true,
  	"push_subscription" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "saints" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"feast_day" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "saints_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"prayers_id" integer
  );
  
  CREATE TABLE "prayers_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "prayers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"category_id" integer NOT NULL,
  	"audio_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mysteries_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_mysteries_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "mysteries_readings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source_key" varchar NOT NULL,
  	"source_label" varchar NOT NULL,
  	"content" jsonb NOT NULL
  );
  
  CREATE TABLE "mysteries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"mystery_type" "enum_mysteries_mystery_type" NOT NULL,
  	"order" numeric NOT NULL,
  	"fruit" varchar NOT NULL,
  	"introduction" jsonb,
  	"audio_meditation_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "briques" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"type" "enum_briques_type" DEFAULT 'text',
  	"audio_file_id" integer,
  	"target_id" integer,
  	"scheduled_date" timestamp(3) with time zone,
  	"published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brique_id" integer NOT NULL,
  	"godchild_id" integer NOT NULL,
  	"reaction" "enum_feedback_reaction",
  	"message" varchar,
  	"comment" varchar,
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prayer_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"godchildren_id" integer,
  	"saints_id" integer,
  	"prayers_id" integer,
  	"mysteries_id" integer,
  	"briques_id" integer,
  	"feedback_id" integer,
  	"prayer_categories_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prayer_page_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_text" jsonb,
  	"catechese_title" varchar DEFAULT 'Qu''est-ce que la prière ?',
  	"catechese_content" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "godchildren_allowed_sources" ADD CONSTRAINT "godchildren_allowed_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."godchildren"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "godchildren" ADD CONSTRAINT "godchildren_patron_saint_id_saints_id_fk" FOREIGN KEY ("patron_saint_id") REFERENCES "public"."saints"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saints" ADD CONSTRAINT "saints_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saints_rels" ADD CONSTRAINT "saints_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."saints"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "saints_rels" ADD CONSTRAINT "saints_rels_prayers_fk" FOREIGN KEY ("prayers_id") REFERENCES "public"."prayers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prayers_tags" ADD CONSTRAINT "prayers_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prayers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prayers" ADD CONSTRAINT "prayers_category_id_prayer_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."prayer_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prayers" ADD CONSTRAINT "prayers_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mysteries_days" ADD CONSTRAINT "mysteries_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mysteries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mysteries_readings" ADD CONSTRAINT "mysteries_readings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mysteries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mysteries" ADD CONSTRAINT "mysteries_audio_meditation_id_media_id_fk" FOREIGN KEY ("audio_meditation_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "briques" ADD CONSTRAINT "briques_audio_file_id_media_id_fk" FOREIGN KEY ("audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "briques" ADD CONSTRAINT "briques_target_id_godchildren_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."godchildren"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback" ADD CONSTRAINT "feedback_brique_id_briques_id_fk" FOREIGN KEY ("brique_id") REFERENCES "public"."briques"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback" ADD CONSTRAINT "feedback_godchild_id_godchildren_id_fk" FOREIGN KEY ("godchild_id") REFERENCES "public"."godchildren"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_godchildren_fk" FOREIGN KEY ("godchildren_id") REFERENCES "public"."godchildren"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_saints_fk" FOREIGN KEY ("saints_id") REFERENCES "public"."saints"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prayers_fk" FOREIGN KEY ("prayers_id") REFERENCES "public"."prayers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mysteries_fk" FOREIGN KEY ("mysteries_id") REFERENCES "public"."mysteries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_briques_fk" FOREIGN KEY ("briques_id") REFERENCES "public"."briques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prayer_categories_fk" FOREIGN KEY ("prayer_categories_id") REFERENCES "public"."prayer_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "godchildren_allowed_sources_order_idx" ON "godchildren_allowed_sources" USING btree ("_order");
  CREATE INDEX "godchildren_allowed_sources_parent_id_idx" ON "godchildren_allowed_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "godchildren_slug_idx" ON "godchildren" USING btree ("slug");
  CREATE INDEX "godchildren_patron_saint_idx" ON "godchildren" USING btree ("patron_saint_id");
  CREATE INDEX "godchildren_updated_at_idx" ON "godchildren" USING btree ("updated_at");
  CREATE INDEX "godchildren_created_at_idx" ON "godchildren" USING btree ("created_at");
  CREATE UNIQUE INDEX "saints_slug_idx" ON "saints" USING btree ("slug");
  CREATE INDEX "saints_image_idx" ON "saints" USING btree ("image_id");
  CREATE INDEX "saints_updated_at_idx" ON "saints" USING btree ("updated_at");
  CREATE INDEX "saints_created_at_idx" ON "saints" USING btree ("created_at");
  CREATE INDEX "saints_rels_order_idx" ON "saints_rels" USING btree ("order");
  CREATE INDEX "saints_rels_parent_idx" ON "saints_rels" USING btree ("parent_id");
  CREATE INDEX "saints_rels_path_idx" ON "saints_rels" USING btree ("path");
  CREATE INDEX "saints_rels_prayers_id_idx" ON "saints_rels" USING btree ("prayers_id");
  CREATE INDEX "prayers_tags_order_idx" ON "prayers_tags" USING btree ("_order");
  CREATE INDEX "prayers_tags_parent_id_idx" ON "prayers_tags" USING btree ("_parent_id");
  CREATE INDEX "prayers_category_idx" ON "prayers" USING btree ("category_id");
  CREATE INDEX "prayers_audio_idx" ON "prayers" USING btree ("audio_id");
  CREATE INDEX "prayers_updated_at_idx" ON "prayers" USING btree ("updated_at");
  CREATE INDEX "prayers_created_at_idx" ON "prayers" USING btree ("created_at");
  CREATE INDEX "mysteries_days_order_idx" ON "mysteries_days" USING btree ("order");
  CREATE INDEX "mysteries_days_parent_idx" ON "mysteries_days" USING btree ("parent_id");
  CREATE INDEX "mysteries_readings_order_idx" ON "mysteries_readings" USING btree ("_order");
  CREATE INDEX "mysteries_readings_parent_id_idx" ON "mysteries_readings" USING btree ("_parent_id");
  CREATE INDEX "mysteries_audio_meditation_idx" ON "mysteries" USING btree ("audio_meditation_id");
  CREATE INDEX "mysteries_updated_at_idx" ON "mysteries" USING btree ("updated_at");
  CREATE INDEX "mysteries_created_at_idx" ON "mysteries" USING btree ("created_at");
  CREATE INDEX "briques_audio_file_idx" ON "briques" USING btree ("audio_file_id");
  CREATE INDEX "briques_target_idx" ON "briques" USING btree ("target_id");
  CREATE INDEX "briques_updated_at_idx" ON "briques" USING btree ("updated_at");
  CREATE INDEX "briques_created_at_idx" ON "briques" USING btree ("created_at");
  CREATE INDEX "feedback_brique_idx" ON "feedback" USING btree ("brique_id");
  CREATE INDEX "feedback_godchild_idx" ON "feedback" USING btree ("godchild_id");
  CREATE INDEX "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
  CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
  CREATE UNIQUE INDEX "prayer_categories_slug_idx" ON "prayer_categories" USING btree ("slug");
  CREATE INDEX "prayer_categories_updated_at_idx" ON "prayer_categories" USING btree ("updated_at");
  CREATE INDEX "prayer_categories_created_at_idx" ON "prayer_categories" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_godchildren_id_idx" ON "payload_locked_documents_rels" USING btree ("godchildren_id");
  CREATE INDEX "payload_locked_documents_rels_saints_id_idx" ON "payload_locked_documents_rels" USING btree ("saints_id");
  CREATE INDEX "payload_locked_documents_rels_prayers_id_idx" ON "payload_locked_documents_rels" USING btree ("prayers_id");
  CREATE INDEX "payload_locked_documents_rels_mysteries_id_idx" ON "payload_locked_documents_rels" USING btree ("mysteries_id");
  CREATE INDEX "payload_locked_documents_rels_briques_id_idx" ON "payload_locked_documents_rels" USING btree ("briques_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
  CREATE INDEX "payload_locked_documents_rels_prayer_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("prayer_categories_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "godchildren_allowed_sources" CASCADE;
  DROP TABLE "godchildren" CASCADE;
  DROP TABLE "saints" CASCADE;
  DROP TABLE "saints_rels" CASCADE;
  DROP TABLE "prayers_tags" CASCADE;
  DROP TABLE "prayers" CASCADE;
  DROP TABLE "mysteries_days" CASCADE;
  DROP TABLE "mysteries_readings" CASCADE;
  DROP TABLE "mysteries" CASCADE;
  DROP TABLE "briques" CASCADE;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "prayer_categories" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "prayer_page_config" CASCADE;
  DROP TYPE "public"."enum_godchildren_theme_color";
  DROP TYPE "public"."enum_mysteries_days";
  DROP TYPE "public"."enum_mysteries_mystery_type";
  DROP TYPE "public"."enum_briques_type";
  DROP TYPE "public"."enum_feedback_reaction";`)
}
