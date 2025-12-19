import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Swal from 'sweetalert2';
import InputValidation from './Layout/Components/InputValidation';

export default function Medicines() {
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        generic_name: '',
        brand_name: '',
        sku: '',
        barcode: '',
        manufacturer: '',
        strength: '',
        form: '',
        description: '',
        price: '',
        unit: '',
        reorder_level: '',
        supplier_id: ''
    });
    const [filterCategory, setFilterCategory] = useState('');
    const [errors, setErrors] = useState({});

    const columns = [
        { header: 'Barcode/SKU', accessor: 'sku', render: (item) => item.barcode || item.sku || '-' },
        { header: 'Name', accessor: 'name' },
        { header: 'Generic Name', accessor: 'generic_name' },
        { header: 'Category', accessor: 'category_id', render: (item) => item.category ? item.category.name : '-' },
        { header: 'Stock', accessor: 'stocks_sum_quantity', render: (item) => item.stocks_sum_quantity || 0 },
        { header: 'Price', accessor: 'price', render: (item) => `$${item.price}` },
        { header: 'Supplier', accessor: 'supplier_id', render: (item) => item.supplier ? item.supplier.name : '-' },
    ];

    useEffect(() => {
        fetchMedicines();
        fetchSuppliers();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await api.get('/medicines');
            setMedicines(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch medicines', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNew = () => {
        setEditingMedicine(null);
        setFormData({
            category_id: '',
            name: '',
            generic_name: '',
            brand_name: '',
            sku: '',
            barcode: '',
            manufacturer: '',
            strength: '',
            form: '',
            description: '',
            price: '',
            unit: '',
            reorder_level: '',
            supplier_id: ''
        });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (medicine) => {
        setEditingMedicine(medicine);
        setFormData({
            category_id: medicine.category_id || '',
            name: medicine.name,
            generic_name: medicine.generic_name || '',
            brand_name: medicine.brand_name || '',
            sku: medicine.sku || '',
            barcode: medicine.barcode || '',
            manufacturer: medicine.manufacturer || '',
            strength: medicine.strength || '',
            form: medicine.form || '',
            description: medicine.description || '',
            price: medicine.price,
            unit: medicine.unit,
            reorder_level: medicine.reorder_level || '',
            supplier_id: medicine.supplier_id || ''
        });
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (medicine) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/medicines/${medicine.id}`);
                fetchMedicines();
                Swal.fire('Deleted!', 'Medicine has been deleted.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to delete medicine', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMedicine) {
                await api.put(`/medicines/${editingMedicine.id}`, formData);
                Swal.fire('Success', 'Medicine updated successfully', 'success');
            } else {
                await api.post('/medicines', formData);
                Swal.fire('Success', 'Medicine created successfully', 'success');
            }
            setShowModal(false);
            fetchMedicines();
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', 'Operation failed', 'error');
            }
        }
    };

    return (
        <div className="section-body">
            <h2 className="section-title mb-2">Medicines</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Medicine List</h4>
                    <div className="card-header-action">
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            <i className="fas fa-plus"></i> Add New
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <select
                                className="form-control"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={filterCategory ? medicines.filter(m => m.category_id == filterCategory) : medicines}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <FormModal
                title={editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            >
                <div className="row">
                    <div className="col-md-6">
                        <InputValidation
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                        />
                    </div>
                    <div className="col-md-6">
                        <label>Category</label>
                        <select
                            className={`form-control ${errors.category_id ? 'is-invalid' : ''}`}
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <InputValidation
                            label="Generic Name"
                            name="generic_name"
                            value={formData.generic_name}
                            onChange={handleInputChange}
                            error={errors.generic_name}
                        />
                    </div>
                    <div className="col-md-6">
                        <InputValidation
                            label="Brand Name"
                            name="brand_name"
                            value={formData.brand_name}
                            onChange={handleInputChange}
                            error={errors.brand_name}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <InputValidation
                            label="SKU"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            error={errors.sku}
                        />
                    </div>
                    <div className="col-md-6">
                        <InputValidation
                            label="Barcode"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            error={errors.barcode}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <InputValidation
                            label="Manufacturer"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleInputChange}
                            error={errors.manufacturer}
                        />
                    </div>
                    <div className="col-md-6">
                        <InputValidation
                            label="Strength (e.g., 500mg)"
                            name="strength"
                            value={formData.strength}
                            onChange={handleInputChange}
                            error={errors.strength}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <InputValidation
                            label="Dosage Form (e.g., Tablet)"
                            name="form"
                            value={formData.form}
                            onChange={handleInputChange}
                            error={errors.form}
                        />
                    </div>
                    <div className="col-md-6">
                        <InputValidation
                            label="Reorder Level"
                            name="reorder_level"
                            type="number"
                            value={formData.reorder_level}
                            onChange={handleInputChange}
                            error={errors.reorder_level}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <InputValidation
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            error={errors.price}
                        />
                    </div>
                    <div className="col-md-6">
                        <InputValidation
                            label="Unit (e.g., Box, Strip)"
                            name="unit"
                            value={formData.unit}
                            onChange={handleInputChange}
                            error={errors.unit}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Supplier</label>
                    <select
                        className={`form-control ${errors.supplier_id ? 'is-invalid' : ''}`}
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {errors.supplier_id && <div className="invalid-feedback">{errors.supplier_id}</div>}
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                    {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>
            </FormModal>
        </div>
    );
}
