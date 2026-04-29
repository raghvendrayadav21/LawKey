package com.legal.platform.backend.payload.response;

import java.util.Map;

public class AnalyticsResponse {

    private long totalDeals;
    private long pendingDeals;
    private long acceptedDeals;
    private long completedDeals;
    private long rejectedDeals;
    private double totalEarnings;
    private Map<String, Double> monthlyEarnings;
    private double winRate;
    private double averageRating;
    private int totalReviews;

    public AnalyticsResponse() {}

    public long getTotalDeals() { return totalDeals; }
    public void setTotalDeals(long totalDeals) { this.totalDeals = totalDeals; }

    public long getPendingDeals() { return pendingDeals; }
    public void setPendingDeals(long pendingDeals) { this.pendingDeals = pendingDeals; }

    public long getAcceptedDeals() { return acceptedDeals; }
    public void setAcceptedDeals(long acceptedDeals) { this.acceptedDeals = acceptedDeals; }

    public long getCompletedDeals() { return completedDeals; }
    public void setCompletedDeals(long completedDeals) { this.completedDeals = completedDeals; }

    public long getRejectedDeals() { return rejectedDeals; }
    public void setRejectedDeals(long rejectedDeals) { this.rejectedDeals = rejectedDeals; }

    public double getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(double totalEarnings) { this.totalEarnings = totalEarnings; }

    public Map<String, Double> getMonthlyEarnings() { return monthlyEarnings; }
    public void setMonthlyEarnings(Map<String, Double> monthlyEarnings) { this.monthlyEarnings = monthlyEarnings; }

    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }
}
