import { configureEcho } from "@laravel/echo-react";
import { FLEET_API } from "./axios";

export const logisticsII = {
  broadcast: {
      config: ()=>configureEcho({
          broadcaster: "ably",
          key: import.meta.env.VITE_FLEET_ABLY_KEY,
          // optional overrides
          // wsHost: "realtime-pusher.ably.io",
          // wsPort: 443,
          // disableStats: true,
          // encrypted: true,
      }) 
  },

  dashboard: {
    index: () => FLEET_API.get("/api/dashboard"),
  },

  vehicles: {
    all: (params = {}) => FLEET_API.get("/api/vehicles/all", { params: params }),
    list: (params = {}) => FLEET_API.get("/api/vehicles", { params: params }),
    details: (params = {}) => FLEET_API.get("/api/vehicles/details", { params: params }),
    register: (payload) => FLEET_API.post("/api/vehicles/register", payload),
    update: (payload) => FLEET_API.put("/api/vehicles/change", payload),
    updateStatus: (payload) => FLEET_API.put("/api/vehicles/change/status", payload),
    changeImage: (formData) =>
      FLEET_API.post("/api/vehicles/change/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  vdocuments: {
    get: (params = {}) =>
      FLEET_API.get("/api/vdocuments/get", { params: params }),
    upload: (formData) =>
      FLEET_API.post("/api/vdocuments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  reservations: {
    list: (params = {}) => FLEET_API.get("/api/reserve", { params: params }),
    details: (params) => FLEET_API.post("/api/reserve/details", params),
    submit: (payload) => FLEET_API.post("/api/reserve/submit", payload),
    costDetails: (id) =>
      FLEET_API.get("/api/reserve/details/cost", { params: { id } }),
    approve: (payload) => FLEET_API.put("/api/reserve/approve", payload),
    reject: (payload) => FLEET_API.put("/api/reserve/cancel", payload),
  },

  drivers: {
    list: (params = {}) => FLEET_API.get("/api/drivers", {params: params}),
    getDrivers: () => FLEET_API.get("/api/drivers/getDrivers"),
    dialogDrivers: (params = {}) => FLEET_API.get("/api/drivers/dialogDrivers", {params: params}),
    driverDetails: (params = {}) => FLEET_API.get("/api/drivers/details", {params: params}),
  },

  dispatches: {
    list: (params = {}) => FLEET_API.get("/api/dispatches", {params: params}),
    details: (params = {}) => FLEET_API.get("/api/dispatches/details", {params: params}),
    start: (id) => FLEET_API.post("/api/dispatches/start", { id }),
  },
}


/**
 * Updates a list state with a new record from a broadcast
 * - Adds the record if it doesn't exist
 * - Updates it if it already exists (merge optional)
 * 
 * @param {Array} prevList - Current state array
 * @param {Object} newRecord - Incoming record from broadcast
 * @param {string} key - Unique identifier key, e.g., "id" or "uuid"
 * @param {boolean} merge - Whether to merge existing record with new data
 */
export function echoUpdateList(prevList, newRecord, key = "id", merge = true) {
  const index = prevList.findIndex(item => item[key] === newRecord[key]);
  //console.log('echoupd called')
  //console.log(index)
  if (index !== -1) {
    // Update existing record
    if (merge) {
      const updated = [...prevList];
      updated[index] = { ...updated[index], ...newRecord };
      return updated;
    }
    // Replace entirely
    return prevList.map(item => item[key] === newRecord[key] ? newRecord : item);
  }

  console.log(prevList)
  // Add new record
  return [newRecord, ...prevList];
}
