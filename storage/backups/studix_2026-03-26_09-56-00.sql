--
-- PostgreSQL database dump
--

\restrict 4maEKcWpDWq5EvpSCKVa5jHZbCkZoRc7gtsXbdvGffxNzSndqggWtUAV9twRsgp

-- Dumped from database version 18.0 (Postgres.app)
-- Dumped by pg_dump version 18.0 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CourseLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseLevel" AS ENUM (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
);


ALTER TYPE public."CourseLevel" OWNER TO postgres;

--
-- Name: GroupHistoryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GroupHistoryType" AS ENUM (
    'CREATED',
    'UPDATED',
    'ARCHIVED',
    'RESTORED',
    'DELETED'
);


ALTER TYPE public."GroupHistoryType" OWNER TO postgres;

--
-- Name: HomeworkStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HomeworkStatus" AS ENUM (
    'APPROVED',
    'REJECTED',
    'PENDING'
);


ALTER TYPE public."HomeworkStatus" OWNER TO postgres;

--
-- Name: HomeworkStatusStudent; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."HomeworkStatusStudent" AS ENUM (
    'COMPLETED',
    'MISSED',
    'DELAY'
);


ALTER TYPE public."HomeworkStatusStudent" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'STUDENT',
    'TEACHER',
    'MANAGEMENT',
    'ADMINISTRATOR'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'FREEZE',
    'DELETED'
);


ALTER TYPE public."Status" OWNER TO postgres;

--
-- Name: StudentHistoryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StudentHistoryType" AS ENUM (
    'CREATED',
    'UPDATED',
    'ARCHIVED',
    'RESTORED',
    'DELETED'
);


ALTER TYPE public."StudentHistoryType" OWNER TO postgres;

--
-- Name: TeacherHistoryType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TeacherHistoryType" AS ENUM (
    'ARCHIVED',
    'DELETED',
    'CREATED',
    'UPDATED',
    'RESTORED'
);


ALTER TYPE public."TeacherHistoryType" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'FREEZE',
    'DELETED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: WeekDays; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WeekDays" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);


ALTER TYPE public."WeekDays" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Attendance" (
    id integer NOT NULL,
    "lessonId" integer NOT NULL,
    "userId" integer,
    "teacherId" integer,
    "studentId" integer NOT NULL,
    "isPresent" boolean NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Attendance" OWNER TO postgres;

--
-- Name: Attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Attendance_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Attendance_id_seq" OWNER TO postgres;

--
-- Name: Attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Attendance_id_seq" OWNED BY public."Attendance".id;


--
-- Name: Course; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Course" (
    id integer NOT NULL,
    name text NOT NULL,
    "durationMonth" integer NOT NULL,
    "durationLesson" integer NOT NULL,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    level public."CourseLevel",
    price numeric(65,30) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Course" OWNER TO postgres;

--
-- Name: Course_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Course_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Course_id_seq" OWNER TO postgres;

--
-- Name: Course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Course_id_seq" OWNED BY public."Course".id;


--
-- Name: Group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Group" (
    id integer NOT NULL,
    "teacherId" integer NOT NULL,
    "userId" integer NOT NULL,
    "roomId" integer NOT NULL,
    "courseId" integer NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "weekDays" public."WeekDays"[],
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Group" OWNER TO postgres;

--
-- Name: GroupHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GroupHistory" (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    "userId" integer,
    type public."GroupHistoryType" NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."GroupHistory" OWNER TO postgres;

--
-- Name: GroupHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."GroupHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."GroupHistory_id_seq" OWNER TO postgres;

--
-- Name: GroupHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."GroupHistory_id_seq" OWNED BY public."GroupHistory".id;


--
-- Name: Group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Group_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Group_id_seq" OWNER TO postgres;

--
-- Name: Group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Group_id_seq" OWNED BY public."Group".id;


--
-- Name: Homework; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Homework" (
    id integer NOT NULL,
    "lessonId" integer NOT NULL,
    "userId" integer,
    "teacherId" integer,
    title text NOT NULL,
    file text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "durationTime" integer DEFAULT 16 NOT NULL
);


ALTER TABLE public."Homework" OWNER TO postgres;

--
-- Name: HomeworkResponse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HomeworkResponse" (
    id integer NOT NULL,
    "homeworkId" integer NOT NULL,
    "studentId" integer NOT NULL,
    title text NOT NULL,
    file text,
    status public."HomeworkStatusStudent" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomeworkResponse" OWNER TO postgres;

--
-- Name: HomeworkResponse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."HomeworkResponse_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."HomeworkResponse_id_seq" OWNER TO postgres;

--
-- Name: HomeworkResponse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."HomeworkResponse_id_seq" OWNED BY public."HomeworkResponse".id;


--
-- Name: HomeworkResult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."HomeworkResult" (
    id integer NOT NULL,
    "homeworkId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "userId" integer,
    "teacherId" integer,
    title text NOT NULL,
    file text,
    score integer NOT NULL,
    status public."HomeworkStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomeworkResult" OWNER TO postgres;

--
-- Name: HomeworkResult_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."HomeworkResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."HomeworkResult_id_seq" OWNER TO postgres;

--
-- Name: HomeworkResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."HomeworkResult_id_seq" OWNED BY public."HomeworkResult".id;


--
-- Name: Homework_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Homework_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Homework_id_seq" OWNER TO postgres;

--
-- Name: Homework_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Homework_id_seq" OWNED BY public."Homework".id;


--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lesson" (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    title text NOT NULL,
    "userId" integer,
    "teacherId" integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO postgres;

--
-- Name: LessonVideo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LessonVideo" (
    id integer NOT NULL,
    "lessonId" integer NOT NULL,
    "userId" integer,
    "teacherId" integer,
    title text NOT NULL,
    file text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LessonVideo" OWNER TO postgres;

--
-- Name: LessonVideo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."LessonVideo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."LessonVideo_id_seq" OWNER TO postgres;

--
-- Name: LessonVideo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."LessonVideo_id_seq" OWNED BY public."LessonVideo".id;


--
-- Name: Lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Lesson_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Lesson_id_seq" OWNER TO postgres;

--
-- Name: Lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Lesson_id_seq" OWNED BY public."Lesson".id;


--
-- Name: Rating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rating" (
    id integer NOT NULL,
    "teacherId" integer NOT NULL,
    "lessonId" integer NOT NULL,
    score integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Rating" OWNER TO postgres;

--
-- Name: Rating_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Rating_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Rating_id_seq" OWNER TO postgres;

--
-- Name: Rating_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Rating_id_seq" OWNED BY public."Rating".id;


--
-- Name: Room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Room" (
    id integer NOT NULL,
    name text NOT NULL,
    capacity integer NOT NULL,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Room" OWNER TO postgres;

--
-- Name: Room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Room_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Room_id_seq" OWNER TO postgres;

--
-- Name: Room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Room_id_seq" OWNED BY public."Room".id;


--
-- Name: Student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Student" (
    id integer NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    photo text,
    password text NOT NULL,
    birth_date timestamp(3) without time zone NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Student" OWNER TO postgres;

--
-- Name: StudentGroup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StudentGroup" (
    id integer NOT NULL,
    "groupId" integer NOT NULL,
    "studentId" integer NOT NULL,
    status public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public."StudentGroup" OWNER TO postgres;

--
-- Name: StudentGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."StudentGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StudentGroup_id_seq" OWNER TO postgres;

--
-- Name: StudentGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."StudentGroup_id_seq" OWNED BY public."StudentGroup".id;


--
-- Name: StudentHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StudentHistory" (
    id integer NOT NULL,
    "studentId" integer NOT NULL,
    "userId" integer,
    type public."StudentHistoryType" NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StudentHistory" OWNER TO postgres;

--
-- Name: StudentHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."StudentHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StudentHistory_id_seq" OWNER TO postgres;

--
-- Name: StudentHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."StudentHistory_id_seq" OWNED BY public."StudentHistory".id;


--
-- Name: Student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Student_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Student_id_seq" OWNER TO postgres;

--
-- Name: Student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Student_id_seq" OWNED BY public."Student".id;


--
-- Name: Teacher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Teacher" (
    id integer NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    photo text,
    password text NOT NULL,
    "position" text NOT NULL,
    experience integer NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "addedBy" text,
    birth_date timestamp(3) without time zone,
    phone text
);


ALTER TABLE public."Teacher" OWNER TO postgres;

--
-- Name: TeacherHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TeacherHistory" (
    id integer NOT NULL,
    "teacherId" integer NOT NULL,
    "userId" integer NOT NULL,
    type public."TeacherHistoryType" NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TeacherHistory" OWNER TO postgres;

--
-- Name: TeacherHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."TeacherHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."TeacherHistory_id_seq" OWNER TO postgres;

--
-- Name: TeacherHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."TeacherHistory_id_seq" OWNED BY public."TeacherHistory".id;


--
-- Name: Teacher_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Teacher_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Teacher_id_seq" OWNER TO postgres;

--
-- Name: Teacher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Teacher_id_seq" OWNED BY public."Teacher".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    photo text,
    password text NOT NULL,
    "position" text NOT NULL,
    role public."Role" NOT NULL,
    hire_date timestamp(3) without time zone NOT NULL,
    address text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance" ALTER COLUMN id SET DEFAULT nextval('public."Attendance_id_seq"'::regclass);


--
-- Name: Course id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course" ALTER COLUMN id SET DEFAULT nextval('public."Course_id_seq"'::regclass);


--
-- Name: Group id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group" ALTER COLUMN id SET DEFAULT nextval('public."Group_id_seq"'::regclass);


--
-- Name: GroupHistory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupHistory" ALTER COLUMN id SET DEFAULT nextval('public."GroupHistory_id_seq"'::regclass);


--
-- Name: Homework id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Homework" ALTER COLUMN id SET DEFAULT nextval('public."Homework_id_seq"'::regclass);


--
-- Name: HomeworkResponse id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResponse" ALTER COLUMN id SET DEFAULT nextval('public."HomeworkResponse_id_seq"'::regclass);


--
-- Name: HomeworkResult id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResult" ALTER COLUMN id SET DEFAULT nextval('public."HomeworkResult_id_seq"'::regclass);


--
-- Name: Lesson id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson" ALTER COLUMN id SET DEFAULT nextval('public."Lesson_id_seq"'::regclass);


--
-- Name: LessonVideo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonVideo" ALTER COLUMN id SET DEFAULT nextval('public."LessonVideo_id_seq"'::regclass);


--
-- Name: Rating id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating" ALTER COLUMN id SET DEFAULT nextval('public."Rating_id_seq"'::regclass);


--
-- Name: Room id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room" ALTER COLUMN id SET DEFAULT nextval('public."Room_id_seq"'::regclass);


--
-- Name: Student id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student" ALTER COLUMN id SET DEFAULT nextval('public."Student_id_seq"'::regclass);


--
-- Name: StudentGroup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentGroup" ALTER COLUMN id SET DEFAULT nextval('public."StudentGroup_id_seq"'::regclass);


--
-- Name: StudentHistory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentHistory" ALTER COLUMN id SET DEFAULT nextval('public."StudentHistory_id_seq"'::regclass);


--
-- Name: Teacher id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teacher" ALTER COLUMN id SET DEFAULT nextval('public."Teacher_id_seq"'::regclass);


--
-- Name: TeacherHistory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherHistory" ALTER COLUMN id SET DEFAULT nextval('public."TeacherHistory_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Attendance" (id, "lessonId", "userId", "teacherId", "studentId", "isPresent", created_at, updated_at) FROM stdin;
1	4	1	\N	2	t	2026-03-17 09:41:59.483	2026-03-17 10:18:15.206
2	4	1	\N	3	t	2026-03-17 09:41:59.495	2026-03-17 10:18:15.21
29	9	1	\N	10	t	2026-03-17 15:42:49.791	2026-03-17 15:42:49.791
\.


--
-- Data for Name: Course; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Course" (id, name, "durationMonth", "durationLesson", status, level, price, description, created_at, updated_at) FROM stdin;
1	Nodejs Backend	8	120	INACTIVE	INTERMEDIATE	120000.000000000000000000000000000000	string	2026-03-13 05:50:46.471	2026-03-15 11:10:33.071
2	Fullstack(nodejs &  react)	6	87	ACTIVE	ADVANCED	2250000.000000000000000000000000000000	Zo'r	2026-03-16 03:46:36.983	2026-03-16 03:46:36.983
3	nodejs	6	180	ACTIVE	INTERMEDIATE	100000000.000000000000000000000000000000	\N	2026-03-17 15:33:05.436	2026-03-17 15:33:05.436
\.


--
-- Data for Name: Group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Group" (id, "teacherId", "userId", "roomId", "courseId", name, "startDate", "startTime", "weekDays", status, created_at, updated_at) FROM stdin;
1	1	1	1	1	N-25	2026-03-13 05:47:57.045	12:30	{MONDAY,TUESDAY,WEDNESDAY}	ACTIVE	2026-03-13 05:52:27.785	2026-03-16 05:52:33.774
2	6	1	2	3	N-26	2026-03-17 00:00:00	20:30	{TUESDAY,THURSDAY,SATURDAY}	ACTIVE	2026-03-17 15:41:29.891	2026-03-17 15:41:29.891
\.


--
-- Data for Name: GroupHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GroupHistory" (id, "groupId", "userId", type, description, created_at) FROM stdin;
1	1	\N	ARCHIVED	Guruh (N-25) arxivga o'tkazildi	2026-03-16 05:52:28.765
2	1	\N	RESTORED	Guruh (N-25) arxivdan qayta faollashtirildi	2026-03-16 05:52:33.778
\.


--
-- Data for Name: Homework; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Homework" (id, "lessonId", "userId", "teacherId", title, file, created_at, updated_at, "durationTime") FROM stdin;
\.


--
-- Data for Name: HomeworkResponse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HomeworkResponse" (id, "homeworkId", "studentId", title, file, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: HomeworkResult; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HomeworkResult" (id, "homeworkId", "studentId", "userId", "teacherId", title, file, score, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lesson" (id, "groupId", title, "userId", "teacherId", created_at, updated_at) FROM stdin;
4	1	Kirish	1	\N	2026-03-17 05:44:03.609	2026-03-17 05:44:03.609
9	2	fxddfxghj	1	\N	2026-03-17 15:42:40.381	2026-03-17 15:42:40.381
\.


--
-- Data for Name: LessonVideo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LessonVideo" (id, "lessonId", "userId", "teacherId", title, file, created_at) FROM stdin;
\.


--
-- Data for Name: Rating; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Rating" (id, "teacherId", "lessonId", score, created_at) FROM stdin;
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Room" (id, name, capacity, status, created_at, updated_at) FROM stdin;
1	Backend xonasi	25	ACTIVE	2026-03-13 05:49:12.516	2026-03-13 05:49:12.516
2	Telegram	2	ACTIVE	2026-03-17 15:33:17.068	2026-03-17 15:33:17.068
\.


--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Student" (id, "fullName", email, photo, password, birth_date, status, created_at, updated_at) FROM stdin;
1	Dilnoza Yusupova	dilnoza@example.com	\N	$2b$10$QyhY/sgLbBk5rcK.4s/p7eK3SiM0UKYbITLqpGI44Atbz.zT9fQNK	2000-05-20 00:00:00	ACTIVE	2026-03-13 05:45:44.376	2026-03-13 05:45:44.376
3	Bunyodbek G'ulomjonov	gulomjonovbunyodbek60@gmail.com	http://localhost:4000/uploads/06b608e5-dcdd-449d-bfdb-850647d48ef7.jpg	$2b$10$peVvzgGmMSmvvKixsDeKBObOkFZShLxS3sX9rIpX7zxZAe0Iovzyu	2005-02-20 00:00:00	ACTIVE	2026-03-13 07:00:23.462	2026-03-16 05:20:11.645
2	Ahrorbek	mengilovahrorbek5@gmail.com	\N	$2b$10$AU0jSH52fcxP6WsOc5n8aepcyyOmiRaUwxyykay2WvmIDkljLbb2y	2000-05-20 00:00:00	ACTIVE	2026-03-13 05:47:04.656	2026-03-16 05:26:34.082
4	Karimov Azamat	4azamat@gmil.ru	\N	$2b$10$IO.UxAY4v.oIaL9NSB5sQeSrskdGfeZrjYYgcJBNby8N2/OFIzWmu	2000-02-20 00:00:00	ACTIVE	2026-03-16 07:03:31.086	2026-03-16 07:10:40.075
5	Odil Azimov 	gulomjonovbunyodbek@gmail.com	\N	$2b$10$Rdik3qE44.6.XjB8DIOVs.VhDhZ1uQ15MIwrBT6toGS6Y2c3qEQk.	2000-02-20 00:00:00	ACTIVE	2026-03-17 15:23:29.823	2026-03-17 15:23:29.823
6	Odil Azimov 	gulomjonovbunyodbe@gmail.com	\N	$2b$10$VEfetepmMEdgHTmHfH/AZOvW2eZK/Vobdcvl75x29c/I7EADaVLoK	2000-02-20 00:00:00	ACTIVE	2026-03-17 15:23:53.798	2026-03-17 15:23:53.798
7	Odil Azimov 	gulomjonovbunyodb@gmail.com	\N	$2b$10$57UjdPyJCeLU57FqtfjwVeIV6bS8ImDHrZ9cB8h9CpOUqVLj4VcrK	2000-02-20 00:00:00	ACTIVE	2026-03-17 15:24:11.773	2026-03-17 15:24:11.773
8	Karimov Azamat	salim@gmail.com	http://localhost:4000/uploads/75f7f8ed-f02d-4660-b0d3-b718635bc3ab.jpg	$2b$10$GyJnVdFwrE4v/C0WF//heeitNpgrEvlBIbgjaqOuCoSnDy.Xabr1y	2001-01-20 00:00:00	ACTIVE	2026-03-17 15:26:34.129	2026-03-17 15:26:34.129
9	Karimov Azamatjon	salim1@gmail.com	http://localhost:4000/uploads/e4d888a2-096c-46df-a6c5-6bf4a4d313cd.jpg	$2b$10$EAECx2yOWVAWNY0YKiIUEOh4bq2dfdun.hiHRLZ5jUJnLv9Xe8ODy	2001-01-20 00:00:00	ACTIVE	2026-03-17 15:30:28.123	2026-03-17 15:30:28.123
10	Ali	ali@gmail.com	\N	$2b$10$4Xl7uxIBtU1gTMZT/9Lz/OLVgBvx3uIxpSTnXOLViY8HK9LPjX0sS	2026-03-17 00:00:00	ACTIVE	2026-03-17 15:32:09.064	2026-03-17 15:32:09.064
\.


--
-- Data for Name: StudentGroup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StudentGroup" (id, "groupId", "studentId", status, created_at, updated_at, "userId") FROM stdin;
1	1	2	ACTIVE	2026-03-13 05:52:53.04	2026-03-16 06:02:34.092	1
2	1	3	ACTIVE	2026-03-13 07:00:28.276	2026-03-16 06:06:00.661	1
3	1	1	INACTIVE	2026-03-16 06:06:08.079	2026-03-16 06:32:16.406	1
4	1	9	ACTIVE	2026-03-17 15:30:30.894	2026-03-17 15:30:30.894	1
5	2	10	ACTIVE	2026-03-17 15:42:31.474	2026-03-17 15:42:31.474	1
\.


--
-- Data for Name: StudentHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StudentHistory" (id, "studentId", "userId", type, description, created_at) FROM stdin;
1	3	\N	ARCHIVED	Student (Bunyodbek G'ulomjonov) arxivga o'tkazildi. Barcha guruhlardagi statusi INACTIVE qilindi	2026-03-16 05:19:38.751
2	3	\N	RESTORED	Student (Bunyodbek G'ulomjonov) arxivdan qayta faollashtirildi	2026-03-16 05:20:11.648
3	2	\N	ARCHIVED	Student (Ahrorbek) arxivga o'tkazildi. Barcha guruhlardagi statusi INACTIVE qilindi	2026-03-16 05:25:46.435
4	2	\N	RESTORED	Student (Ahrorbek) arxivdan qayta faollashtirildi	2026-03-16 05:26:34.088
\.


--
-- Data for Name: Teacher; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Teacher" (id, "fullName", email, photo, password, "position", experience, status, created_at, updated_at, "addedBy", birth_date, phone) FROM stdin;
1	Jasur Karimov	jasur@example.com	\N	$2b$10$6JC11f3lGNWYlVffycSuoegw95RGD4.h6Rs1ck5Sxek0kdVEsnKju	Backend Developer	5	INACTIVE	2026-03-13 05:48:08.955	2026-03-15 10:29:05.997	\N	\N	\N
5	Bunyodbek G'ulomjonov	gulomjonovbunyodbek60@gmail.com	238b0966-efdf-44e1-9855-085825228fb7.png	$2b$10$/WguaYOfeenGwTsNHFNIZudX4HZKolfYccSk/UVMQOeK1Q2xkgy0S	Frontend	2	ACTIVE	2026-03-15 06:51:52.342	2026-03-15 10:55:45.337	SUPERADMIN	2006-02-20 00:00:00	+998939349340
6	Alijon	alijon@gmail.com	\N	$2b$10$Q7PmYhrEeEj651Jm1dTkEuvCjE0k1OaVNySN0RyiQqGEs2/4aSOty	nodejs	2	ACTIVE	2026-03-17 15:32:44.985	2026-03-17 15:34:25.503	SUPERADMIN	2026-03-17 00:00:00	+998939349349
\.


--
-- Data for Name: TeacherHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TeacherHistory" (id, "teacherId", "userId", type, description, created_at) FROM stdin;
1	5	1	ARCHIVED	O'qituvchi (Bunyodbek G'ulomjonov) arxivga o'tkazildi	2026-03-15 10:50:10.776
2	5	1	RESTORED	O'qituvchi (Bunyodbek G'ulomjonov) arxivdan qayta faollashtirildi	2026-03-15 10:55:34.543
3	5	1	ARCHIVED	O'qituvchi (Bunyodbek G'ulomjonov) arxivga o'tkazildi	2026-03-15 10:55:40.993
4	5	1	RESTORED	O'qituvchi (Bunyodbek G'ulomjonov) arxivdan qayta faollashtirildi	2026-03-15 10:55:45.339
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "fullName", email, photo, password, "position", role, hire_date, address, status, created_at, updated_at) FROM stdin;
1	Bunyodbek	gulomjonovbumyodbek60@gmail.com	\N	$2b$10$hKsntxAXe3CSevlXbNahmeBmKP0AO0exyRN1R7rzh4drs4XrZqJr2	Full-Stack	SUPERADMIN	2026-01-01 00:00:00	\N	ACTIVE	2026-03-09 07:45:36.378	2026-03-09 07:45:36.378
7	John Doe	gulomjonovbunyodbek9@gmail.com	\N	$2b$10$nCS8lYELKoK/LpVpuDaKEeMd7nv1z3HOA0JHAN.jq6HW2qn/b2bW2	Frontend Developer	ADMIN	2024-01-15 00:00:00	Tashkent, Uzbekistan	ACTIVE	2026-03-09 08:25:52.045	2026-03-09 08:25:52.045
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
dec15630-3269-4e94-a1ad-6e7136e297a5	0d3f4a4d32a2f0e7883eddcf4a93930033452ee3bd63d6f5334a76f98a4ce289	2026-03-07 14:32:46.175612+05	20260307093246_status_default_active	\N	\N	2026-03-07 14:32:46.1388+05	1
d40869a8-73ed-43a0-8fd6-9d587f1b273a	f6f87e6caad8ecddb34e6e6790ce34442cef8e7572f9c42f34b159323bce85c1	2026-03-07 14:41:06.405809+05	20260307094106_capacity_removed_group_table	\N	\N	2026-03-07 14:41:06.403253+05	1
\.


--
-- Name: Attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Attendance_id_seq"', 29, true);


--
-- Name: Course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Course_id_seq"', 3, true);


--
-- Name: GroupHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."GroupHistory_id_seq"', 2, true);


--
-- Name: Group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Group_id_seq"', 2, true);


--
-- Name: HomeworkResponse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."HomeworkResponse_id_seq"', 1, false);


--
-- Name: HomeworkResult_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."HomeworkResult_id_seq"', 1, false);


--
-- Name: Homework_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Homework_id_seq"', 1, false);


--
-- Name: LessonVideo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."LessonVideo_id_seq"', 1, false);


--
-- Name: Lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Lesson_id_seq"', 9, true);


--
-- Name: Rating_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Rating_id_seq"', 1, false);


--
-- Name: Room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Room_id_seq"', 2, true);


--
-- Name: StudentGroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."StudentGroup_id_seq"', 5, true);


--
-- Name: StudentHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."StudentHistory_id_seq"', 4, true);


--
-- Name: Student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Student_id_seq"', 10, true);


--
-- Name: TeacherHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TeacherHistory_id_seq"', 4, true);


--
-- Name: Teacher_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Teacher_id_seq"', 6, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: Course Course_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY (id);


--
-- Name: GroupHistory GroupHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupHistory"
    ADD CONSTRAINT "GroupHistory_pkey" PRIMARY KEY (id);


--
-- Name: Group Group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (id);


--
-- Name: HomeworkResponse HomeworkResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResponse"
    ADD CONSTRAINT "HomeworkResponse_pkey" PRIMARY KEY (id);


--
-- Name: HomeworkResult HomeworkResult_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResult"
    ADD CONSTRAINT "HomeworkResult_pkey" PRIMARY KEY (id);


--
-- Name: Homework Homework_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_pkey" PRIMARY KEY (id);


--
-- Name: LessonVideo LessonVideo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonVideo"
    ADD CONSTRAINT "LessonVideo_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Rating Rating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_pkey" PRIMARY KEY (id);


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY (id);


--
-- Name: StudentGroup StudentGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentGroup"
    ADD CONSTRAINT "StudentGroup_pkey" PRIMARY KEY (id);


--
-- Name: StudentHistory StudentHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentHistory"
    ADD CONSTRAINT "StudentHistory_pkey" PRIMARY KEY (id);


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: TeacherHistory TeacherHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherHistory"
    ADD CONSTRAINT "TeacherHistory_pkey" PRIMARY KEY (id);


--
-- Name: Teacher Teacher_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Teacher"
    ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Attendance_lessonId_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Attendance_lessonId_studentId_key" ON public."Attendance" USING btree ("lessonId", "studentId");


--
-- Name: Course_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Course_name_key" ON public."Course" USING btree (name);


--
-- Name: Group_courseId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Group_courseId_name_key" ON public."Group" USING btree ("courseId", name);


--
-- Name: Group_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Group_name_key" ON public."Group" USING btree (name);


--
-- Name: Room_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Room_name_key" ON public."Room" USING btree (name);


--
-- Name: StudentGroup_groupId_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StudentGroup_groupId_studentId_key" ON public."StudentGroup" USING btree ("groupId", "studentId");


--
-- Name: Student_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Student_email_key" ON public."Student" USING btree (email);


--
-- Name: Teacher_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Teacher_email_key" ON public."Teacher" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Attendance Attendance_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Attendance Attendance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GroupHistory GroupHistory_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupHistory"
    ADD CONSTRAINT "GroupHistory_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GroupHistory GroupHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupHistory"
    ADD CONSTRAINT "GroupHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Group Group_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public."Course"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Group Group_roomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES public."Room"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Group Group_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Group Group_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HomeworkResponse HomeworkResponse_homeworkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResponse"
    ADD CONSTRAINT "HomeworkResponse_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES public."Homework"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HomeworkResponse HomeworkResponse_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResponse"
    ADD CONSTRAINT "HomeworkResponse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HomeworkResult HomeworkResult_homeworkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResult"
    ADD CONSTRAINT "HomeworkResult_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES public."Homework"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HomeworkResult HomeworkResult_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResult"
    ADD CONSTRAINT "HomeworkResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HomeworkResult HomeworkResult_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResult"
    ADD CONSTRAINT "HomeworkResult_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HomeworkResult HomeworkResult_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeworkResult"
    ADD CONSTRAINT "HomeworkResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Homework Homework_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Homework Homework_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Homework Homework_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Homework"
    ADD CONSTRAINT "Homework_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LessonVideo LessonVideo_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonVideo"
    ADD CONSTRAINT "LessonVideo_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LessonVideo LessonVideo_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonVideo"
    ADD CONSTRAINT "LessonVideo_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LessonVideo LessonVideo_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LessonVideo"
    ADD CONSTRAINT "LessonVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lesson Lesson_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lesson Lesson_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lesson Lesson_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Rating Rating_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Rating Rating_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentGroup StudentGroup_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentGroup"
    ADD CONSTRAINT "StudentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."Group"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentGroup StudentGroup_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentGroup"
    ADD CONSTRAINT "StudentGroup_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentHistory StudentHistory_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentHistory"
    ADD CONSTRAINT "StudentHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."Student"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudentHistory StudentHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StudentHistory"
    ADD CONSTRAINT "StudentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TeacherHistory TeacherHistory_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherHistory"
    ADD CONSTRAINT "TeacherHistory_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."Teacher"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TeacherHistory TeacherHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TeacherHistory"
    ADD CONSTRAINT "TeacherHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 4maEKcWpDWq5EvpSCKVa5jHZbCkZoRc7gtsXbdvGffxNzSndqggWtUAV9twRsgp

