import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Button, Row, Col, Container, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrders } from '../api/axios';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        merchant: '',
        customer: '',
        created_after: '',
        created_before: ''
    });

    const prevOrdersRef = useRef({});

    useEffect(() => {
        fetchOrders();
        // Polling for live updates every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [filters]); // Refresh when filters change, and keep polling with current filters

    const fetchOrders = async () => {
        try {
            // Filter out empty strings
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await getOrders(params);
            const newOrders = response.data;

            // Check for status updates
            newOrders.forEach(order => {
                const prevStatus = prevOrdersRef.current[order.id];
                if (prevStatus && prevStatus !== order.current_status) {
                    toast.info(
                        <div>
                            <strong>Status Update</strong><br />
                            Order #{order.id.slice(0, 8)}: {prevStatus} ➔ {order.current_status}
                        </div>
                    );
                }
                prevOrdersRef.current[order.id] = order.current_status;
            });

            setOrders(newOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchOrders();
    };

    const getStatusBadge = (status) => {
        const variants = {
            created: 'primary',
            picked_up: 'info',
            in_transit: 'warning',
            delivered: 'success',
            cancelled: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Orders</h2>
                <Link to="/orders/new" className="btn btn-primary">Create Order</Link>
            </div>

            <Form onSubmit={handleSearch} className="mb-4">
                <Row className="align-items-end">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">All Statuses</option>
                                <option value="created">Created</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Merchant Ref</Form.Label>
                            <Form.Control
                                type="text"
                                name="merchant"
                                value={filters.merchant}
                                onChange={handleFilterChange}
                                placeholder="Search Merchant"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Customer Contact</Form.Label>
                            <Form.Control
                                type="text"
                                name="customer"
                                value={filters.customer}
                                onChange={handleFilterChange}
                                placeholder="Search Customer"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="created_after"
                                value={filters.created_after}
                                onChange={handleFilterChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="created_before"
                                value={filters.created_before}
                                onChange={handleFilterChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Button variant="secondary" type="submit" className="w-100 mt-4">
                            Apply Filters
                        </Button>
                    </Col>
                </Row>
            </Form>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Merchant Ref</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <tr key={order.id}>
                                <td><Link to={`/orders/${order.id}`}>{order.id.substring(0, 8)}...</Link></td>
                                <td>{order.customer_name}</td>
                                <td>{order.customer_contact}</td>
                                <td>{order.merchant_ref}</td>
                                <td>{getStatusBadge(order.current_status)}</td>
                                <td>{new Date(order.created_at).toLocaleString()}</td>
                                <td>
                                    <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-primary">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">No orders found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default OrderList;
