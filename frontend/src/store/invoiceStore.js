import { create } from "zustand";
import axios from "axios";
import { API_BASE_URL } from "../lib/api";

// point this at your own API
const API_URL = `${API_BASE_URL}/api/invoice`;

export const useInvoiceStore = create((set) => ({
  // state
  invoiceCount: 0,
  isLoading: false,
  error: null,

  // actions
  fetchInvoiceCount: async (userId) => {
    set({
      isLoading: true,
      error: null,
    });
    try {
      const res = await axios.get(`${API_URL}/count`, {
        params: {
          userId,
        },
        withCredentials: true,
      });
      if (res.data.success) {
        set({
          invoiceCount: res.data.count,
          periodStart: res.data.periodStart,
          nextReset: res.data.nextReset,
        });
      } else {
        set({
          error: res.data.message,
        });
      }
    } catch (err) {
      set({
        error: err.message,
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },

  setInvoiceCount: (count) => {
    set({
      invoiceCount: count,
    });
  },

  incrementInvoiceCount: () => {
    set((state) => ({
      invoiceCount: state.invoiceCount + 1,
    }));
  },
}));
