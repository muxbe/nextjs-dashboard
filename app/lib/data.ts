// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data

import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { customers, invoices, revenue } from './placeholder-data';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)
    console.log('Fetching revenue data...');
    await delay(3000);

    console.log('Data fetch completed after 3 seconds.');

    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    // Get the latest 5 invoices
    const latestInvoices = invoices
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(invoice => {
        const customer = customers.find(c => c.id === invoice.customer_id);
        return {
          id: invoice.customer_id,
          name: customer?.name || 'Unknown',
          image_url: customer?.image_url || '',
          email: customer?.email || '',
          amount: formatCurrency(invoice.amount),
        };
      });

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const numberOfInvoices = invoices.length;
    const numberOfCustomers = customers.length;
    
    const totalPaidInvoices = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const totalPendingInvoices = invoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices: formatCurrency(totalPaidInvoices),
      totalPendingInvoices: formatCurrency(totalPendingInvoices),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Filter invoices based on query
    const filteredInvoices = invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customer_id);
      if (!customer) return false;
      
      const searchTerm = query.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        invoice.amount.toString().includes(searchTerm) ||
        invoice.date.includes(searchTerm) ||
        invoice.status.toLowerCase().includes(searchTerm)
      );
    });

    // Sort by date (newest first) and paginate
    const sortedInvoices = filteredInvoices
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + ITEMS_PER_PAGE);

    // Format the data to match the expected structure
    const formattedInvoices: InvoicesTable[] = sortedInvoices.map(invoice => {
      const customer = customers.find(c => c.id === invoice.customer_id);
      return {
        id: invoice.customer_id,
        customer_id: invoice.customer_id,
        name: customer?.name || 'Unknown',
        email: customer?.email || '',
        image_url: customer?.image_url || '',
        date: invoice.date,
        amount: invoice.amount,
        status: invoice.status,
      };
    });

    return formattedInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const filteredInvoices = invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customer_id);
      if (!customer) return false;
      
      const searchTerm = query.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        invoice.amount.toString().includes(searchTerm) ||
        invoice.date.includes(searchTerm) ||
        invoice.status.toLowerCase().includes(searchTerm)
      );
    });

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = invoices.find(inv => inv.customer_id === id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const invoiceForm: InvoiceForm = {
      id: invoice.customer_id,
      customer_id: invoice.customer_id,
      amount: invoice.amount / 100, // Convert from cents to dollars
      status: invoice.status,
    };

    return invoiceForm;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customerFields: CustomerField[] = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
    }));

    return customerFields;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const filteredCustomers = customers.filter(customer => {
      const searchTerm = query.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
      );
    });

    const customersWithStats: CustomersTableType[] = filteredCustomers.map(customer => {
      const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
      const totalInvoices = customerInvoices.length;
      const totalPending = customerInvoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const totalPaid = customerInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
        total_invoices: totalInvoices,
        total_pending: totalPending,
        total_paid: totalPaid,
      };
    });

    return customersWithStats;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}