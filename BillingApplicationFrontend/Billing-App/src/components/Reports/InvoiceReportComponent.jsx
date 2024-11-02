import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InvoiceReportComponent = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/invoices/reports');
                setReports(response.data);
            } catch (error) {
                console.error('Error fetching invoice reports:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchReports();
    }, []);

    // Prepare data for the chart
    const chartData = {
        labels: reports.map(report => `Invoice ${report.invoiceId}`),
        datasets: [
            {
                label: 'Total Amount',
                data: reports.map(report => report.totalAmount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Paid Amount',
                data: reports.map(report => report.paidAmount),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
            {
                label: 'Outstanding Amount',
                data: reports.map(report => report.outstandingAmount),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
        ],
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Invoice Reports
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice ID</TableCell>
                                    <TableCell>Invoice Date</TableCell>
                                    <TableCell>Total Amount</TableCell>
                                    <TableCell>Paid Amount</TableCell>
                                    <TableCell>Outstanding Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.map(report => (
                                    <TableRow key={report.invoiceId}>
                                        <TableCell>{report.invoiceId}</TableCell>
                                        <TableCell>{new Date(report.invoiceDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{report.totalAmount}</TableCell>
                                        <TableCell>{report.paidAmount}</TableCell>
                                        <TableCell>{report.outstandingAmount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default InvoiceReportComponent;
