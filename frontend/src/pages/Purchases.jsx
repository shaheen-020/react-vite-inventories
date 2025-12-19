import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import api from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Swal from 'sweetalert2';
import InputValidation from './Layout/Components/InputValidation';

export default function Purchases() {

    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        supplier_id: '',
        date: new Date().toISOString().split('T')[0],
        voucher_no: '',
        invoice_no: '',
        payment_status: 'paid',
        status: 'completed',
        items: []
    });

    const columns = [
        { header: 'Date', accessor: 'date' },
        { header: 'Voucher No', accessor: 'voucher_no' },
        {
            header: 'Supplier',
            accessor: 'supplier_id',
            render: item => item.supplier ? item.supplier.name : '-'
        },
        {
            header: 'Total Amount',
            accessor: 'total_amount',
            render: item => `$${item.total_amount}`
        },
        { header: 'Payment Status', accessor: 'payment_status' },
        { header: 'Status', accessor: 'status' }
    ];

    useEffect(() => {
        fetchPurchases();
        fetchSuppliers();
        fetchMedicines();
    }, []);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const res = await api.get('/purchases');
            setPurchases(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            console.log('Suppliers loaded:', res.data);
            setSuppliers(res.data);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            Swal.fire('Warning', 'Could not load suppliers. You can still create new ones.', 'warning');
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

    const [view, setView] = useState('list'); // 'list' or 'add'

    const handleAddNew = () => {
        setFormData({
            supplier_id: '',
            date: new Date().toISOString().split('T')[0],
            voucher_no: '',
            invoice_no: '',
            payment_status: 'paid',
            status: 'completed',
            items: [
                { medicine_id: '', quantity: 1, cost_price: 0, expiry_date: '', batch_no: '' }
            ]
        });
        setView('add');
    };

    const handleItemChange = (index, field, value) => {
        const items = [...formData.items];
        items[index][field] = value;
        setFormData({ ...formData, items });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { medicine_id: '', quantity: 1, cost_price: 0 }]
        });
    };

    const removeItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const calculateTotal = () => {
        return formData.items.reduce(
            (sum, i) => sum + (Number(i.quantity) * Number(i.cost_price)),
            0
        ).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.supplier_id) {
            Swal.fire('Error', 'Please select a supplier', 'error');
            return;
        }

        try {
            await api.post('/purchases', formData);
            Swal.fire('Success', 'Purchase saved & stock updated', 'success');
            setView('list');
            fetchPurchases();
        } catch (err) {
            Swal.fire('Error', 'Failed to save purchase', 'error');
            console.error(err);
        }
    };

    const handleCreateSupplier = async (inputValue) => {
        try {
            const res = await api.post('/suppliers', {
                name: inputValue,
                contact_person: '',
                phone: '',
                email: '',
                address: ''
            });
            await fetchSuppliers();
            setFormData({ ...formData, supplier_id: res.data.id });
            Swal.fire('Success', `Supplier "${inputValue}" created!`, 'success');
            return res.data;
        } catch (err) {
            Swal.fire('Error', 'Failed to create supplier', 'error');
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

    const supplierOptions = suppliers.map(s => ({
        value: s.id,
        label: s.name
    }));

    const medicineOptions = medicines.map(m => ({
        value: m.id,
        label: `${m.name} (${m.sku})`
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

    return (
        <section className="section">
            <div className="section-body">
                <div className="section-header d-flex justify-content-between">
                    <h1>Purchases (Stock In)</h1>
                    {view === 'list' && (
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            + New Purchase
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
                            <h4>Purchase History</h4>
                        </div>
                        <div className="card-body">
                            <DataTable columns={columns} data={purchases} loading={loading} />
                        </div>
                    </div>
                ) : (
                    <div className="card mt-4">
                        <div className="card-header bg-primary text-white">
                            <h4>New Purchase Form</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label>Supplier *</label>
                                        <CreatableSelect
                                            options={supplierOptions}
                                            value={supplierOptions.find(s => s.value === formData.supplier_id) || null}
                                            onChange={opt => setFormData({ ...formData, supplier_id: opt?.value || '' })}
                                            onCreateOption={handleCreateSupplier}
                                            placeholder="Select or type to create supplier"
                                            formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                            noOptionsMessage={() => "Type to create a new supplier"}
                                            isClearable
                                            styles={selectStyles}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <InputValidation
                                            label="Voucher No"
                                            value={formData.voucher_no}
                                            onChange={(e) => setFormData({ ...formData, voucher_no: e.target.value })}
                                            placeholder="AUTO"
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <InputValidation
                                            label="Date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="row mt-3">
                                    <div className="col-md-6">
                                        <InputValidation
                                            label="Invoice No"
                                            value={formData.invoice_no}
                                            onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                                            placeholder="Supplier Invoice No"
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label>Payment Status</label>
                                        <select
                                            className="form-control"
                                            value={formData.payment_status}
                                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending</option>
                                            <option value="partial">Partial</option>
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="completed">Completed</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <hr className="my-4" />
                                <h5>Items to Stock In</h5>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="border rounded p-3 mb-3 bg-light">
                                        <div className="row">
                                            <div className="col-md-12 mb-2">
                                                <label>Medicine *</label>
                                                <CreatableSelect
                                                    options={medicineOptions}
                                                    value={medicineOptions.find(m => m.value === item.medicine_id) || null}
                                                    onChange={opt => handleItemChange(index, 'medicine_id', opt?.value || '')}
                                                    onCreateOption={handleCreateMedicine}
                                                    placeholder="Select or type to create medicine"
                                                    formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                                    noOptionsMessage={() => "Type to create a new medicine"}
                                                    isClearable
                                                    styles={selectStyles}
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <InputValidation
                                                    label="Quantity"
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                    min="1"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <InputValidation
                                                    label="Cost Price"
                                                    type="number"
                                                    step="0.01"
                                                    value={item.cost_price}
                                                    onChange={e => handleItemChange(index, 'cost_price', e.target.value)}
                                                    min="0"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <InputValidation
                                                    label="Batch No"
                                                    value={item.batch_no || ''}
                                                    onChange={e => handleItemChange(index, 'batch_no', e.target.value)}
                                                    placeholder="Batch Number"
                                                />
                                            </div>

                                            <div className="col-md-3">
                                                <InputValidation
                                                    label="Expiry Date"
                                                    type="date"
                                                    value={item.expiry_date || ''}
                                                    onChange={e => handleItemChange(index, 'expiry_date', e.target.value)}
                                                />
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
                                    <h3>Total Amount: ${calculateTotal()}</h3>
                                </div>

                                <hr className="my-4" />
                                <div className="d-flex justify-content-end">
                                    <button type="button" className="btn btn-secondary mr-2" onClick={() => setView('list')}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success btn-lg px-5">
                                        Save Purchase & Update Stock
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
