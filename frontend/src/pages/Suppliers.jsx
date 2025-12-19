import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Swal from 'sweetalert2';
import InputValidation from './Layout/Components/InputValidation';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        contact_person: '',
        address: ''
    });
    const [errors, setErrors] = useState({});

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Contact Person', accessor: 'contact_person' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
    ];

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNew = () => {
        setEditingSupplier(null);
        setFormData({ name: '', email: '', phone: '', contact_person: '', address: '' });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            email: supplier.email || '',
            phone: supplier.phone || '',
            contact_person: supplier.contact_person || '',
            address: supplier.address || ''
        });
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (supplier) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/suppliers/${supplier.id}`);
                fetchSuppliers();
                Swal.fire('Deleted!', 'Supplier has been deleted.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to delete supplier', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier.id}`, formData);
                Swal.fire('Success', 'Supplier updated successfully', 'success');
            } else {
                await api.post('/suppliers', formData);
                Swal.fire('Success', 'Supplier created successfully', 'success');
            }
            setShowModal(false);
            fetchSuppliers();
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
            <h2 className="section-title">Suppliers</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Supplier List</h4>
                    <div className="card-header-action">
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            <i className="fas fa-plus"></i> Add New
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={suppliers}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <FormModal
                title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            >
                <InputValidation
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                />
                <InputValidation
                    label="Contact Person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    error={errors.contact_person}
                />
                <InputValidation
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                />
                <InputValidation
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                />
                <div className="form-group">
                    <label>Address</label>
                    <textarea
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                    ></textarea>
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>
            </FormModal>
        </div>
    );
}
