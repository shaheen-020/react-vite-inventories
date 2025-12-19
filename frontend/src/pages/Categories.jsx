import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Swal from 'sweetalert2';
import InputValidation from './Layout/Components/InputValidation';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
    ];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setErrors({});
        setShowModal(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setErrors({});
        setShowModal(true);
    };

    const handleDelete = async (category) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/categories/${category.id}`);
                fetchCategories();
                Swal.fire('Deleted!', 'Category has been deleted.', 'success');
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Failed to delete category', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData);
                Swal.fire('Success', 'Category updated successfully', 'success');
            } else {
                await api.post('/categories', formData);
                Swal.fire('Success', 'Category created successfully', 'success');
            }
            setShowModal(false);
            fetchCategories();
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
            <h2 className="section-title mb-2">Categories</h2>
            <div className="card">
                <div className="card-header">
                    <h4>Category List</h4>
                    <div className="card-header-action">
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            <i className="fas fa-plus"></i> Add New
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={categories}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <FormModal
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            >
                <div className="form-group">
                    <InputValidation
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                    />
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
