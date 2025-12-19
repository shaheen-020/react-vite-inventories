import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_medicines: 0,
        total_customers: 0,
        total_suppliers: 0,
        todays_sales: 0,
        low_stock: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        }
    };

    return (
        <div className="section-body">
            <h2 className="section-title mb-2">Dashboard</h2>
            <div className="row">
                <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="card card-statistic-1">
                        <div className="card-icon bg-primary">
                            <i className="fas fa-pills"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Total Medicines</h4>
                            </div>
                            <div className="card-body">
                                {stats.total_medicines}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="card card-statistic-1">
                        <div className="card-icon bg-danger">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Customers</h4>
                            </div>
                            <div className="card-body">
                                {stats.total_customers}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="card card-statistic-1">
                        <div className="card-icon bg-warning">
                            <i className="fas fa-truck"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Suppliers</h4>
                            </div>
                            <div className="card-body">
                                {stats.total_suppliers}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="card card-statistic-1">
                        <div className="card-icon bg-success">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div className="card-wrap">
                            <div className="card-header">
                                <h4>Today's Sales</h4>
                            </div>
                            <div className="card-body">
                                ${stats.todays_sales}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8 col-md-12 col-12 col-sm-12">
                    <div className="card">
                        <div className="card-header">
                            <h4>Low Stock Alert</h4>
                        </div>
                        <div className="card-body">
                            {stats.low_stock && stats.low_stock.length > 0 ? (
                                <ul className="list-group">
                                    {stats.low_stock.map(m => (
                                        <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            {m.name}
                                            <span className="badge badge-danger badge-pill">
                                                {m.stocks_sum_quantity || 0}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No low stock items.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
