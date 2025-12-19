import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Swal from 'sweetalert2';

export default function MedicineStock() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);


    const [medicines, setMedicines] = useState([]);

    const columns = [
        { header: 'Medicine Name', accessor: 'medicine_name', render: (item) => item.medicine.name },
        { header: 'Batch No', accessor: 'batch_no' },
        { header: 'Expiry Date', accessor: 'expiry_date' },
        { header: 'Quantity', accessor: 'quantity' },
    ];


    const columnsWithStock = [
        { header: 'Medicine Name', accessor: 'name' },
        { header: 'SKU', accessor: 'sku' },
        {
            header: 'Total Stock', accessor: 'stocks_sum_quantity', render: (item) => {
                return <span className={`badge ${item.stocks_sum_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {item.stocks_sum_quantity || 0} {item.unit}
                </span>
            }
        },
    ];

    // I will update MedicineController index to include 'stocks'.

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            // I will update backend to include stocks in index
            const response = await api.get('/medicines?include_stocks=true');
            // My backend doesn't handle this param yet.
            // I'll just change backend to always include 'stocks' for now or add 'withCount' at least.
            setMedicines(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch stocks', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-body">
            <h2 className="section-title mb-2">Medicine Stocks</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Current Stock Levels</h4>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columnsWithStock}
                        data={medicines}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}

