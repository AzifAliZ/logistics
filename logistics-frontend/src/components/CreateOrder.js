import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder } from '../api/axios';

const CreateOrder = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_contact: '',
        merchant_ref: ''
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createOrder(formData);
            navigate('/');
        } catch (err) {
            setError("Failed to create order. Please check your input and try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="mt-5">
            <Card>
                <Card.Header as="h5">Create New Order</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Customer Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="customer_name"
                                value={formData.customer_name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Customer Contact</Form.Label>
                            <Form.Control
                                type="text"
                                name="customer_contact"
                                value={formData.customer_contact}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Merchant Reference</Form.Label>
                            <Form.Control
                                type="text"
                                name="merchant_ref"
                                value={formData.merchant_ref}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Link to="/" className="btn btn-secondary">Cancel</Link>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Order'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CreateOrder;
