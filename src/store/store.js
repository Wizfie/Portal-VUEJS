import { createStore } from "vuex";

export default createStore({
  state: {
    authToken: null,
    authData: null,
    selectedTeam: null,

    evaluations: [],
  },
  mutations: {
    setAuthToken(state, token) {
      state.authToken = token;
    },
    setUserData(state, user) {
      state.authData = user;
    },
    setEvaluationsLapangan(state, evaluation) {
      state.evaluations.push(evaluation);
    },
    setSelectedTeam(state, teamId) {
      state.selectedTeam = teamId;
    },
    clearAuthToken(state) {
      state.authToken = null;
      state.authData = null;
    },
    clearEvaluations(state) {
      state.evaluations = [];
    },
    clearSelectedTeam(state) {
      state.selectedTeam = null;
    },
  },
  actions: {
    saveUserDataAndToken({ commit }, { token, user }) {
      commit("setAuthToken", token);
      commit("setUserData", user);
    },
    setEvaluationsLapangan({ commit }, evaluation) {
      commit("setEvaluationsLapangan", evaluation);
    },

    setSelectedTeam({ commit }, teamId) {
      commit("setSelectedTeam", teamId);
    },
    clearAuthToken({ commit }) {
      commit("clearAuthToken");
    },
    clearEvaluations({ commit }) {
      commit("clearEvaluations");
    },
    clearSelectedTeam({ commit }) {
      commit("clearSelectedTeam");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.authToken,
    getUserData: (state) => state.authData,
    getAuthToken: (state) => state.authToken,
    getEvaluations: (state) => state.evaluations,
    getSelectedTeam: (state) => state.selectedTeam,
  },
});
