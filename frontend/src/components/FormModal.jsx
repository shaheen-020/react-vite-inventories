import React from 'react';

export default function FormModal({ title, show, onClose, onSubmit, children, submitWebBtnText = "Save" }) {
    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', overflowY: 'auto', zIndex: 1100 }} role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered" role="document" style={{ maxWidth: '720px', margin: '1.75rem auto' }}>
                <div className="modal-content" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '1.25rem 2rem' }}>
                        <h5 className="modal-title" style={{ fontWeight: '700', color: '#1e293b' }}>{title}</h5>
                        <button type="button" className="close" onClick={onClose} aria-label="Close" style={{ fontSize: '1.5rem' }}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.8rem 2rem' }}>
                            {children}
                        </div>
                        <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem 2rem', background: '#f8fafc', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ borderRadius: '10px', fontWeight: '600' }}>Close</button>
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px', padding: '0.6rem 2rem', fontWeight: '700', boxShadow: '0 4px 12px var(--accent-glow)' }}>{submitWebBtnText}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
