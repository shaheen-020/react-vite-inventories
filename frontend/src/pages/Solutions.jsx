import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Swal from 'sweetalert2';
import InputValidation from './Layout/Components/InputValidation';

export default function Solutions() {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSolution, setEditingSolution] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        category: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    const columns = [
        { header: 'Solution Name', accessor: 'name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Category', accessor: 'category' },
        { header: 'Description', accessor: 'description' },
    ];

    useEffect(() => {
        fetchSolutions();
    }, []);

    const fetchSolutions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/solutions');
            setSolutions(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch solutions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNew = () => {
        setEditingSolution(null);
        setFormData({ name: '', type: '', category: '', description: '' });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (solution) => {
        setEditingSolution(solution);
        setFormData({
            name: solution.name,
            type: solution.type,
            category: solution.category,
            description: solution.description || ''
        });
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (solution) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/solutions/${solution.id}`);
                fetchSolutions();
                Swal.fire('Deleted!', 'Solution has been deleted.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to delete solution', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSolution) {
                await api.put(`/solutions/${editingSolution.id}`, formData);
                Swal.fire('Success', 'Solution updated successfully', 'success');
            } else {
                await api.post('/solutions', formData);
                Swal.fire('Success', 'Solution created successfully', 'success');
            }
            setShowModal(false);
            fetchSolutions();
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
            <h2 className="section-title mb-2">Solutions Management</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Solutions List</h4>
                    <div className="card-header-action">
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            <i className="fas fa-plus"></i> Add New
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={solutions}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <FormModal
                title={editingSolution ? 'Edit Solution' : 'Add New Solution'}
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            >
                <div className="form-group">
                    <InputValidation
                        label="Solution Name"
                        name="name"
                        placeholder="e.g., Syrup, Injection, Saline"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                    />
                </div>

                <div className="form-group">
                    <label>Solution Type</label>
                    <select
                        className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                    >
                        <option value="">-- Select Type --</option>
                        <option value="Liquid">Liquid</option>
                        <option value="Semi-liquid">Semi-liquid</option>
                        <option value="Solid">Solid</option>
                    </select>
                    {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                    >
                        <option value="">-- Select Category --</option>
                        <option value="Oral">Oral</option>
                        <option value="Injectable">Injectable</option>
                        <option value="External">External</option>
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>

                <div className="form-group">
                    <label>Description (short use info)</label>
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
