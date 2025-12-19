import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/DataTable';

export default function Reports() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportType, setReportType] = useState(searchParams.get('type') || 'sales');
    const [customerId, setCustomerId] = useState('');
    const [medicineId, setMedicineId] = useState('');
    const [customers, setCustomers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [data, setData] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [summaryData, setSummaryData] = useState(null); // For profit report
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const type = searchParams.get('type');
        if (type) setReportType(type);
    }, [searchParams]);

    useEffect(() => {
        setData([]); // Clear old data to prevent column mismatch errors
        setSummaryData(null);
        if (reportType === 'sales') {
            fetchCustomers();
        } else if (reportType === 'stock-card' || reportType === 'inventory') {
            fetchMedicines();
        }
    }, [reportType]);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchMedicines = async () => {
        try {
            const response = await api.get('/medicines');
            setMedicines(response.data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
        }
    };

    const fetchReport = async () => {
        if (reportType === 'stock-card' && !medicineId) {
            alert('Please select a medicine first');
            return;
        }

        setLoading(true);
        setSummaryData(null);
        try {
            let endpoint = '';
            const params = { start_date: startDate, end_date: endDate };

            switch (reportType) {
                case 'sales':
                    endpoint = '/reports/sales';
                    if (customerId) params.customer_id = customerId;
                    break;
                case 'purchases':
                    endpoint = '/reports/purchases';
                    break;
                case 'stock-card':
                    endpoint = '/reports/stock-card';
                    params.medicine_id = medicineId;
                    break;
                case 'inventory':
                    endpoint = '/reports/inventory';
                    break;
                case 'expiry':
                    endpoint = '/reports/expiry';
                    break;
                case 'profit':
                    endpoint = '/reports/profit';
                    break;
                default:
                    endpoint = '/reports/sales';
            }

            const response = await api.get(endpoint, { params });

            if (reportType === 'stock-card') {
                setOpeningBalance(response.data.opening_balance);
                let currentBal = response.data.opening_balance;
                const movementWithBal = response.data.movements.map(m => {
                    currentBal = currentBal + (m.in || 0) - (m.out || 0);
                    return { ...m, balance: currentBal };
                });
                setData(movementWithBal);
            } else if (reportType === 'profit') {
                setSummaryData(response.data);
                setData([]);
            } else {
                setData(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columnsMap = {
        sales: [
            { header: 'Sales date', accessor: 'date' },
            { header: 'Invoice number', accessor: 'invoice_no' },
            { header: 'Customer name', accessor: 'customer_id', render: (item) => item.customer ? item.customer.name : 'Walk-in' },
            { header: 'Total amount', accessor: 'total_amount', render: (item) => `$${item.total_amount}` },
        ],
        purchases: [
            { header: 'Date', accessor: 'date' },
            { header: 'Purchase ID', accessor: 'id', render: (item) => `#${item.id}` },
            { header: 'Supplier', accessor: 'supplier_id', render: (item) => item.supplier ? item.supplier.name : '-' },
            { header: 'Amount', accessor: 'total_amount', render: (item) => `$${item.total_amount}` },
            { header: 'Status', accessor: 'status' },
        ],
        'stock-card': [
            { header: 'Date', accessor: 'date' },
            { header: 'Reference (Purchase / Sale / Return)', accessor: 'ref' },
            { header: 'Description', accessor: 'description' },
            { header: 'Quantity In', accessor: 'in', render: (item) => <span className="text-success">{item.in > 0 ? `+${item.in}` : '-'}</span> },
            { header: 'Quantity Out', accessor: 'out', render: (item) => <span className="text-danger">{item.out > 0 ? `-${item.out}` : '-'}</span> },
            { header: 'Balance Stock', accessor: 'balance', render: (item) => <strong>{item.balance}</strong> },
        ],
        inventory: [
            { header: 'Medicine Name', accessor: 'name' },
            { header: 'SKU', accessor: 'sku' },
            { header: 'Current Stock', accessor: 'stock' },
            { header: 'Unit Price', accessor: 'price', render: (item) => `$${item.price || 0}` },
            { header: 'Stock Value', accessor: 'value', render: (item) => `$${(item.value || 0).toFixed(2)}` },
        ],
        expiry: [
            { header: 'Medicine', accessor: 'medicine_id', render: (item) => item.medicine ? item.medicine.name : 'N/A' },
            { header: 'Batch No', accessor: 'batch_no' },
            { header: 'Expiry Date', accessor: 'expiry_date' },
            { header: 'Quantity', accessor: 'quantity' },
            {
                header: 'Days Left', accessor: 'expiry_date', render: (item) => {
                    const diff = new Date(item.expiry_date) - new Date();
                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    return <span className={days < 30 ? "text-danger" : "text-warning"}>{days} days</span>
                }
            },
        ]
    };

    return (
        <div className="section-body">
            <h2 className="section-title">Reports Management</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Generate Detailed Insights</h4>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="form-group">
                                <label>Report Module</label>
                                <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                    <option value="sales">Sales Summary</option>
                                    <option value="purchases">Purchase Summary</option>
                                    <option value="stock-card">Stock Card (Item Ledger)</option>
                                    <option value="inventory">Inventory Valuation</option>
                                    <option value="expiry">Expiry Forecast</option>
                                    <option value="profit">Profit & Loss Analysis</option>
                                </select>
                            </div>
                        </div>

                        {reportType === 'sales' && (
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Customer Filter</label>
                                    <select className="form-control" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                                        <option value="">All Customers</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {reportType === 'stock-card' && (
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Select Medicine</label>
                                    <select className="form-control" value={medicineId} onChange={(e) => setMedicineId(e.target.value)}>
                                        <option value="">-- Select Item --</option>
                                        {medicines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {(reportType !== 'inventory' && reportType !== 'expiry') && (
                            <>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>From</label>
                                        <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>To</label>
                                        <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="col-md-2">
                            <button className="btn btn-primary mt-4 w-100" onClick={fetchReport}>
                                <i className="fas fa-search mr-1"></i> Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {reportType === 'profit' && summaryData ? (
                <div className="row">
                    <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                        <div className="card card-statistic-1">
                            <div className="card-icon bg-primary"><i className="fas fa-shopping-cart"></i></div>
                            <div className="card-wrap">
                                <div className="card-header"><h4>Total Sales</h4></div>
                                <div className="card-body">${summaryData.revenue}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                        <div className="card card-statistic-1">
                            <div className="card-icon bg-success"><i className="fas fa-money-bill-wave"></i></div>
                            <div className="card-wrap">
                                <div className="card-header"><h4>Est. Profit (30%)</h4></div>
                                <div className="card-body">${(summaryData.estimated_profit || 0).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                        <div className="card card-statistic-1">
                            <div className="card-icon bg-warning"><i className="fas fa-file-invoice"></i></div>
                            <div className="card-wrap">
                                <div className="card-header"><h4>Invoice Count</h4></div>
                                <div className="card-body">{summaryData.count}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header d-flex justify-content-between">
                        <h4>{reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')} Results</h4>
                        {reportType === 'stock-card' && (
                            <div className="badge badge-info p-2 mt-2">Opening Balance: {openingBalance}</div>
                        )}
                        {reportType === 'inventory' && data.length > 0 && (
                            <div className="badge badge-success p-2 mt-2">
                                Total Valuation: ${data.reduce((sum, item) => sum + (item.value || 0), 0).toFixed(2)}
                            </div>
                        )}
                    </div>
                    <div className="card-body">
                        <DataTable
                            columns={columnsMap[reportType] || []}
                            data={data}
                            loading={loading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
