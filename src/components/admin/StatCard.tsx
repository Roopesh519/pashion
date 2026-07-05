import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color = '#3b82f6' }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card-content">
                <div className="stat-card-info">
                    <p className="stat-card-title">{title}</p>
                    <h3 className="stat-card-value">{value}</h3>
                    {trend && (
                        <div className={`stat-card-trend ${trend.isUp ? 'up' : 'down'}`}>
                            <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span>
                            <span className="trend-label">vs last month</span>
                        </div>
                    )}
                </div>
                <div className="stat-card-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}
