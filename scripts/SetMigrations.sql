BEGIN TRANSACTION;

DROP TABLE IF EXISTS public.migrations CASCADE;

CREATE TABLE public.migrations (
    id          integer   NOT NULL,
    "timestamp" bigint    NOT NULL,
    name        VARCHAR   NOT NULL
);

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_Migrations" PRIMARY KEY (id);

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);

INSERT INTO public.migrations ("timestamp", name)
VALUES
	(1594413973851, 'V01MigrateClientStorage1594413973851'),
	(1594582514749, 'V02MigrateDashboardUsers1594582514749'),
	(1594582821724, 'V03MigrateBanners1594582821724'),
	(1594582905434, 'V04MigrateGiveaways1594582905434'),
	(1594583103788, 'V05MigrateGuilds1594583103788'),
	(1594583243068, 'V06MigrateMembers1594583243068'),
	(1594583300041, 'V07MigrateModeration1594583300041'),
	(1594625931497, 'V08MigrateUsers1594625931497'),
	(1594628900945, 'V09MigrateSuggestion1594628900945'),
	(1594629639526, 'V10MigrateTwitchSubscription1594629639526'),
	(1594649287397, 'V11MigrateRpg1594649287397'),
	(1594669268323, 'V12ClearOldTables1594669268323'),
	(1594757329224, 'V13MigrateAnalytics1594757329224'),
	(1594843508131, 'V14FixRpgGuildRankEntity1594843508131'),
	(1594843508131, 'V15ClearDashboardUsers1594922379627'),
	(1595064247769, 'V16CreateSpousesTable1595064247769');

COMMIT;
