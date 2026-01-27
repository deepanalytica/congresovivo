/**
 * Server-side data fetching utilities for Chilean Congress Open Data
 * Simplified version for MVP - uses fallback to mock data if API fails
 */

import { mockStats, mockBills } from '../data/mock-data';

/**
 * Fetch real legislative statistics
 * For now, returns mock data enhanced with real API calls in future iterations
 */
export async function fetchStats() {
    try {
        // TODO: Implement real API calls here
        // For now, return mock data to ensure the dashboard works
        return mockStats;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return mockStats;
    }
}

/**
 * Fetch real legislative bills
 * For now, returns mock data enhanced with real API calls in future iterations
 */
export async function fetchBills() {
    try {
        // TODO: Implement real API calls here
        // For now, return mock data to ensure the dashboard works
        return mockBills;
    } catch (error) {
        console.error('Error fetching bills:', error);
        return mockBills;
    }
}
