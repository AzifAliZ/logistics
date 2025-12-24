import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrder, getOrderHistory, updateOrderStatus } from '../api/axios';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [history, setHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updateError, setUpdateError] = useState(null);

    // Memoize fetchData to avoid dependency warnings or infinite loops if added to useEffect deps without care
    const fetchData = useCallback(async () => {
        try {
            const [orderRes, historyRes] = await Promise.all([
                getOrder(id),
                getOrderHistory(id)
            ]);
            setOrder(orderRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll every 3 seconds for active order details
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleUpdateStatus = async () => {
        try {
            setUpdateError(null);
            const response = await updateOrderStatus(id, {
                status: newStatus,
                source: 'admin_panel' // Assuming admin/user for now
            });

            // Show success notification with email details if available
            if (response.data.email_simulation) {
                toast.success(
                    <div>
                        <strong>Status Updated!</strong><br />
                        Email Simulation: {response.data.email_simulation.status}<br />
                        To: {response.data.email_simulation.to.join(', ')}
                    </div>
                );
            } else {
                toast.success("Status updated successfully");
            }

            setShowModal(false);
            setNewStatus('');
            fetchData(); // Refresh data
        } catch (error) {
            setUpdateError(error.response?.data?.message || "Failed to update status");
        }
    };

    if (!order) return <Container className="mt-5"><p>Loading...</p></Container>;

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
        <Container className="mt-5">
            <Link to="/" className="btn btn-secondary mb-3">&larr; Back to Orders</Link>

            <Card className="mb-4">
                <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                    <span>Order #{order.id.split('-')[0]}</span>
                    {getStatusBadge(order.current_status)}
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <p><strong>Customer:</strong> {order.customer_name}</p>
                            <p><strong>Contact:</strong> {order.customer_contact}</p>
                        </Col>
                        <Col md={6}>
                            <p><strong>Merchant Ref:</strong> {order.merchant_ref}</p>
                            <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        </Col>
                    </Row>
                    <Button variant="primary" onClick={() => setShowModal(true)}>Update Status</Button>
                </Card.Body>
            </Card>

            <h4>Status History</h4>
            <Table striped bordered size="sm">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((entry, idx) => (
                        <tr key={idx}>
                            <td>{getStatusBadge(entry.status)}</td>
                            <td>{entry.source}</td>
                            <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Order Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {updateError && <Alert variant="danger">{updateError}</Alert>}
                    <Form.Group>
                        <Form.Label>New Status</Form.Label>
                        <Form.Select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleUpdateStatus} disabled={!newStatus}>Calculate & Update</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OrderDetail;
