import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Swal from 'sweetalert2';
import InputValidation from './Layout/Components/InputValidation';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNew = () => {
        setEditingCustomer(null);
        setFormData({ name: '', email: '', phone: '', address: '' });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || ''
        });
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (customer) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/customers/${customer.id}`);
                fetchCustomers();
                Swal.fire('Deleted!', 'Customer has been deleted.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to delete customer', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await api.put(`/customers/${editingCustomer.id}`, formData);
                Swal.fire('Success', 'Customer updated successfully', 'success');
            } else {
                await api.post('/customers', formData);
                Swal.fire('Success', 'Customer created successfully', 'success');
            }
            setShowModal(false);
            fetchCustomers();
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
            <h2 className="section-title">Customers</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Customer List</h4>
                    <div className="card-header-action">
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            <i className="fas fa-plus"></i> Add New
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={customers}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <FormModal
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
