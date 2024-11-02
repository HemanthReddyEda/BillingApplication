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
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const OutstandingInvoiceReportComponent = () => {
    const [outstandingReports, setOutstandingReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOutstandingInvoices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/invoices/outstanding-reports');
                setOutstandingReports(response.data);
            } catch (error) {
                console.error('Error fetching outstanding invoices:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOutstandingInvoices();
    }, []);

    // Prepare data for the pie chart
    const pieData = {
        labels: outstandingReports.map(report => `Invoice ${report.invoiceId}`),
        datasets: [
            {
                label: 'Outstanding Amounts',
                data: outstandingReports.map(report => report.outstandingAmount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
            },
        ],
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Outstanding Invoice Reports
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Invoice ID</TableCell>
                                    <TableCell>Customer ID</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell>Outstanding Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {outstandingReports.map(report => (
                                    <TableRow key={report.invoiceId}>
                                        <TableCell>{report.invoiceId}</TableCell>
                                        <TableCell>{report.customerId}</TableCell>
                                        <TableCell>{new Date(report.dueDate).toLocaleDateString()}</TableCell>
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

export default OutstandingInvoiceReportComponent;
