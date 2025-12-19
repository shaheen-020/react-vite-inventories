import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';
import api from '../services/api';

import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import InputValidation from './Layout/Components/InputValidation';


function Invoices() {

    // ================= STATES =================
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        invoice_no: '',
        payment_method: 'cash',
        discount: 0,
        items: []
    });

    // ================= TABLE COLUMNS =================
    const columns = [
        { header: 'Date', accessor: 'date' },
        { header: 'Invoice No', accessor: 'invoice_no' },
        {
            header: 'Customer',
            accessor: 'customer_id',
            render: (row) => row.customer ? row.customer.name : 'Walk-in'
        },
        { header: 'Total', accessor: 'total_amount', render: (row) => `$${row.total_amount}` },
        { header: 'Net Total', accessor: 'net_total', render: (row) => `$${row.net_total}` },
        { header: 'Payment', accessor: 'payment_method' },
    ];

    // ================= FETCH DATA =================
    useEffect(() => {
        fetchInvoices();
        fetchCustomers();
        fetchMedicines();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/invoices');
            setInvoices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            console.log('Customers loaded:', res.data);
            setCustomers(res.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
            Swal.fire('Warning', 'Could not load customers. You can still create new ones.', 'warning');
        }
    };

    const fetchMedicines = async () => {
        try {
            const res = await api.get('/medicines');
            console.log('Medicines loaded:', res.data);
            setMedicines(res.data);
        } catch (err) {
            console.error('Error fetching medicines:', err);
            Swal.fire('Warning', 'Could not load medicines. You can still create new ones.', 'warning');
        }
    };

    // ================= SELECT OPTIONS =================
    const customerOptions = customers.map(c => ({
        value: c.id,
        label: c.name
    }));

    const medicineOptions = medicines.map(m => ({
        value: m.id,
        label: `${m.name} (Stock: ${m.stocks_sum_quantity || 0})`,
        price: m.price,
        stock: m.stocks_sum_quantity || 0
    }));

    const selectStyles = {
        control: (base) => ({
            ...base,
            height: '42px',
            borderRadius: '8px',
            borderColor: '#e4e6fc',
            '&:hover': {
                borderColor: '#958be4'
            }
        }),
        singleValue: (base) => ({
            ...base,
            color: '#495057'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#aab2b7'
        })
    };

    // ================= CREATE HANDLERS =================
    const handleCreateCustomer = async (inputValue) => {
        try {
            const res = await api.post('/customers', {
                name: inputValue,
                phone: '',
                email: '',
                address: ''
            });
            await fetchCustomers();
            setFormData({ ...formData, customer_id: res.data.id });
            Swal.fire('Success', `Customer "${inputValue}" created!`, 'success');
            return res.data;
        } catch (err) {
            Swal.fire('Error', 'Failed to create customer', 'error');
        }
    };

    const handleCreateMedicine = async (inputValue) => {
        try {
            const res = await api.post('/medicines', {
                name: inputValue,
                sku: 'SKU-' + Date.now(),
                description: '',
                price: 0,
                unit: 'pcs',
                supplier_id: null
            });
            await fetchMedicines();
            Swal.fire('Success', `Medicine "${inputValue}" created!`, 'success');
            return res.data;
        } catch (err) {
            Swal.fire('Error', 'Failed to create medicine', 'error');
        }
    };

    const [view, setView] = useState('list'); // 'list' or 'add'

    // ================= HANDLERS =================
    const handleAddNew = () => {
        const randomInv = 'INV-' + Math.floor(100000 + Math.random() * 900000);

        setFormData({
            customer_id: '',
            date: new Date().toISOString().split('T')[0],
            invoice_no: randomInv,
            payment_method: 'cash',
            discount: 0,
            items: [{ medicine_id: '', quantity: 1, unit_price: 0, stock_available: 0 }]
        });
        setView('add');
    };

    const handleItemChange = (index, field, value) => {
        const items = [...formData.items];
        items[index][field] = value;

        if (field === 'medicine_id') {
            const med = medicines.find(m => m.id === value);
            items[index].unit_price = med ? med.price : 0;
            items[index].stock_available = med ? med.stocks_sum_quantity || 0 : 0;
        }

        setFormData({ ...formData, items });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { medicine_id: '', quantity: 1, unit_price: 0, stock_available: 0 }]
        });
    };

    const removeItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const calculateTotals = () => {
        const total = formData.items.reduce(
            (sum, i) => sum + (Number(i.quantity) * Number(i.unit_price)), 0
        );
        const discount = Number(formData.discount) || 0;
        return {
            total: total.toFixed(2),
            net: (total - discount).toFixed(2)
        };
    };

    const { total, net } = calculateTotals();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customer_id) {
            Swal.fire('Error', 'Please select a customer', 'error');
            return;
        }

        for (let item of formData.items) {
            if (item.quantity > item.stock_available) {
                Swal.fire(
                    'Error',
                    `Insufficient stock for medicine. Available: ${item.stock_available}`,
                    'error'
                );
                return;
            }
        }

        try {
            await api.post('/invoices', formData);
            Swal.fire('Success', 'Invoice created successfully', 'success');
            setView('list');
            fetchInvoices();
            fetchMedicines();
        } catch (err) {
            Swal.fire('Error', 'Failed to create invoice', 'error');
        }
    };

    // ================= UI =================
    return (
        <section className="section">
            <div className="section-body">
                <div className="section-header d-flex justify-content-between">
                    <h1>Invoices (Stock Out / Sales)</h1>
                    {view === 'list' && (
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            + New Invoice
                        </button>
                    )}
                    {view === 'add' && (
                        <button className="btn btn-secondary" onClick={() => setView('list')}>
                            Back to List
                        </button>
                    )}
                </div>

                {view === 'list' ? (
                    <div className="card mt-4">
                        <div className="card-header">
                            <h4>Recent Sales</h4>
                        </div>
                        <div className="card-body">
                            <DataTable columns={columns} data={invoices} loading={loading} />
                        </div>
                    </div>
                ) : (
                    <div className="card mt-4">
                        <div className="card-header bg-primary text-white">
                            <h4>Create New Invoice</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Customer *</label>
                                        <CreatableSelect
                                            options={customerOptions}
                                            value={customerOptions.find(c => c.value === formData.customer_id) || null}
                                            onChange={(o) =>
                                                setFormData({ ...formData, customer_id: o ? o.value : '' })
                                            }
                                            onCreateOption={handleCreateCustomer}
                                            placeholder="Select or type to create customer"
                                            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                            noOptionsMessage={() => "Type to create a new customer"}
                                            isClearable
                                            styles={selectStyles}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <InputValidation
                                            label="Invoice No"
                                            value={formData.invoice_no}
                                            readOnly
                                            required
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <InputValidation
                                            label="Date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) =>
                                                setFormData({ ...formData, date: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="row mt-3">
                                    <div className="col-md-6">
                                        <label>Payment Method</label>
                                        <select
                                            className="form-control"
                                            value={formData.payment_method}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="bkash">bKash</option>
                                            <option value="card">Card</option>
                                            <option value="due">Due</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <InputValidation
                                            label="Overall Discount"
                                            type="number"
                                            value={formData.discount}
                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <h5>Items to Sell</h5>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="border rounded p-3 mb-3 bg-light">
                                        <div className="row">
                                            <div className="col-md-12 mb-2">
                                                <label>Select Medicine *</label>
                                                <CreatableSelect
                                                    options={medicineOptions}
                                                    value={medicineOptions.find(m => m.value === item.medicine_id) || null}
                                                    onChange={(o) =>
                                                        handleItemChange(index, 'medicine_id', o ? o.value : '')
                                                    }
                                                    onCreateOption={handleCreateMedicine}
                                                    placeholder="Select or type to create medicine"
                                                    formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                                    noOptionsMessage={() => "Type to create a new medicine"}
                                                    isClearable
                                                    styles={selectStyles}
                                                />
                                                <small className="text-muted d-block mt-1">
                                                    Stock Available: <span className={`font-weight-bold ${item.stock_available < 10 ? 'text-danger' : 'text-success'}`}>{item.stock_available}</span>
                                                </small>
                                            </div>
                                        </div>

                                        <div className="row mt-2">
                                            <div className="col-md-4">
                                                <InputValidation
                                                    label="Quantity"
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    min="1"
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <InputValidation
                                                    label="Unit Price"
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                                />
                                            </div>

                                            <div className="col-md-4 d-flex align-items-end">
                                                <div className="form-group w-100">
                                                    <label>Subtotal</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={`$${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}`}
                                                        disabled
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm mt-2"
                                            onClick={() => removeItem(index)}
                                            disabled={formData.items.length === 1}
                                        >
                                            <i className="fas fa-trash"></i> Remove Item
                                        </button>
                                    </div>
                                ))}

                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <button type="button" className="btn btn-info" onClick={addItem}>
                                        <i className="fas fa-plus"></i> Add Another Item
                                    </button>
                                    <div className="text-right">
                                        <h6>Total: ${total}</h6>
                                        <h3 className="text-primary">Net Payable: ${net}</h3>
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <div className="d-flex justify-content-end">
                                    <button type="button" className="btn btn-secondary mr-2" onClick={() => setView('list')}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success btn-lg px-5">
                                        Complete Sale & Update Stock
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Invoices;
