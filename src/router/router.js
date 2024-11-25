import { createRouter, createWebHistory } from "vue-router";
import isAuthenticated from "./routeGuards";

// Auth
import login from "@/Views/Auth/Login.vue";
import register from "@/Views/Auth/Register.vue";

// Pages
import dashboard from "@/Views/Pages/Dashboard.vue";
import profile from "@/Views/Pages/Profile.vue";
import teams from "@/Views/Pages/Teams.vue";
import teamsDetail from "@/Views/Pages/Teams-Details.vue";
import event from "@/Views/Pages/Event.vue";
import eventDetail from "@/Views/Pages/Event-Details.vue";
import historyEvent from "@/Views/Pages/History-Event.vue";
import yelyelPenilaian from "@/Views/Pages/YelYel-penilaian.vue";
import evaluasiYelyel from "@/Views/Pages/Evaluasi-Yelyel.vue";
import UserGuide from "@/Views/Pages/User-Guide.vue";

// Admin
import adminEventDetail from "@/Views/Pages/admin/Admin-Event-Detail.vue";
import awards from "@/Views/Pages/admin/Admin-Awarding-Lapangan.vue";
import awardsYelyel from "@/Views/Pages/admin/Admin-Awarding-Yelyel.vue";
import adminEvent from "@/Views/Pages/admin/Admin-Event.vue";
import adminTeam from "@/Views/Pages/admin/Admin-Teams.vue";
import adminUsers from "@/Views/Pages/admin/Admin-Users.vue";
import adminEvaluasiLapangan from "@/Views/Pages/admin/Admin-Evaluasi-Lapangan.vue";
import adminEvaluasiYelyel from "@/Views/Pages/admin/Admin-Evaluasi-Yelyel.vue";
import adminEvaluasiPresentasi from "@/Views/Pages/admin/Admin-Evaluasi-Presentasi.vue";
import adminListPertanyaan from "@/Views/Pages/admin/Admin-List-Pertanyaan.vue";
import AdminReport from "@/Views/Pages/admin/Admin-Report.vue";
import AdminEventList from "@/Views/Pages/admin/Admin-Event-List.vue";

// QCC
import evaluasiLapanganQcc from "@/Views/Pages/qcc/Evaluasi-Lapangan-Qcc.vue";
import evaluasiPresentasiQcc from "@/Views/Pages/qcc/Evaluasi-Presentasi-Qcc.vue";
import lapanganQcc from "@/Views/Pages/qcc/Lapangan-Qcc.vue";
import presentasiQcc from "@/Views/Pages/qcc/Presentasi-Qcc.vue";

// SS
import LapanganSs from "@/Views/Pages/ss/Lapangan-ss.vue";
import PresentasiSs from "@/Views/Pages/ss/Presentasi-ss.vue";
import EvaluasiLapanganSs from "@/Views/Pages/ss/Evaluasi-Lapangan-ss.vue";
import EvaluasiPresentasiSs from "@/Views/Pages/ss/Evaluasi-Presentasi-ss.vue";

const routes = [
  // Auth Routes
  {
    path: "/",
    name: "login",
    component: login,
  },
  {
    path: "/register",
    name: "register",
    component: register,
  },

  // General Pages
  {
    path: "/dashboard",
    name: "dashboard",
    component: dashboard,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/profile",
    name: "profile",
    component: profile,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/teams",
    name: "teams",
    component: teams,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/teams-details/:teamId",
    name: "teams-details",
    component: teamsDetail,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/event",
    name: "event",
    component: event,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/userguide",
    name: "userguide",
    component: UserGuide,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/event/:registrationId",
    name: "eventDetail",
    component: eventDetail,
    beforeEnter: isAuthenticated,
  },

  // Admin Routes
  {
    path: "/admin-event",
    name: "adminEvent",
    component: adminEvent,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin-event/list",
    name: "adminEventList",
    component: AdminEventList,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/details/:registrationId",
    name: "registration-details",
    component: adminEventDetail,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/teams",
    name: "Admin-Teams",
    component: adminTeam,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: adminUsers,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/evaluasi-lapangan",
    name: "admin-evaluasi-lapangan",
    component: adminEvaluasiLapangan,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/evaluasi-presentasi",
    name: "admin-evaluasi-presentasi",
    component: adminEvaluasiPresentasi,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/evaluasi-yelyel",
    name: "admin-evaluasi-yelyel",
    component: adminEvaluasiYelyel,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/awards",
    name: "awards",
    component: awards,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/report",
    name: "admin-report",
    component: AdminReport,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/awards/yelyel",
    name: "awards-yelyel",
    component: awardsYelyel,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/admin/list-pertanyaan/:title",
    name: "list-pertanyaan",
    component: adminListPertanyaan,
    props: true,
    beforeEnter: isAuthenticated,
  },

  // QCC Routes
  {
    path: "/lapangan-qcc",
    name: "lapangan-qcc",
    component: lapanganQcc,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/evaluasi/lapangan-qcc/:teamId/:eventId/:teamName",
    name: "evaluasi-lapangan-qcc",
    component: evaluasiLapanganQcc,
    beforeEnter: isAuthenticated,
  },

  {
    path: "/presentasi-qcc",
    name: "presentasi-qcc",
    component: presentasiQcc,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/evaluasi/presentasi-qcc/:teamId/:eventId/:teamName",
    name: "evaluasi-presentasi-qcc",
    component: evaluasiPresentasiQcc,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/yel-yel-penilaian",
    name: "yel-yel-penilaian",
    component: yelyelPenilaian,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/evaluasi/yelyel/:deptName/:deptId",
    name: "evaluasi-yelyel",
    component: evaluasiYelyel,
    beforeEnter: isAuthenticated,
  },

  // SS Routes
  {
    path: "/lapangan-ss",
    name: "lapangan-ss",
    component: LapanganSs,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/presentasi-ss",
    name: "presentasi-ss",
    component: PresentasiSs,
    beforeEnter: isAuthenticated,
  },

  {
    path: "/evaluasi/lapangan-ss/:teamId/:eventId/:teamName",
    name: "evaluasi-lapangan-ss",
    component: EvaluasiLapanganSs,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/evaluasi/presentasi-ss/:teamId/:eventId/:teamName",
    name: "evaluasi-presentasi-ss",
    component: EvaluasiPresentasiSs,
    beforeEnter: isAuthenticated,
  },
  {
    path: "/history-event",
    name: "history-event",
    component: historyEvent,
    beforeEnter: isAuthenticated,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
