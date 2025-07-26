import { db } from '../db';
import { weddingProjects, tasks, guests, budgetItems, vendors, inspirationItems, scheduleEvents } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import XLSX from 'xlsx';
import { MailService } from '@sendgrid/mail';

// Initialize SendGrid if API key is available
let mailService: MailService | null = null;
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface ExportData {
  project: any;
  tasks: any[];
  guests: any[];
  budgetItems: any[];
  vendors: any[];
  inspirationItems: any[];
  scheduleEvents: any[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalGuests: number;
    confirmedGuests: number;
    totalBudget: number;
    spentBudget: number;
    totalVendors: number;
    bookedVendors: number;
  };
}

export async function getAllProjectData(projectId: number): Promise<ExportData> {
  try {
    // Fetch all data for the project
    const [project] = await db.select().from(weddingProjects).where(eq(weddingProjects.id, projectId));
    const projectTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId));
    const projectGuests = await db.select().from(guests).where(eq(guests.projectId, projectId));
    const projectBudgetItems = await db.select().from(budgetItems).where(eq(budgetItems.projectId, projectId));
    const projectVendors = await db.select().from(vendors).where(eq(vendors.projectId, projectId));
    const projectInspirationItems = await db.select().from(inspirationItems).where(eq(inspirationItems.projectId, projectId));
    const projectScheduleEvents = await db.select().from(scheduleEvents).where(eq(scheduleEvents.projectId, projectId));

    // Calculate statistics
    const stats = {
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.completedAt !== null).length,
      totalGuests: projectGuests.length,
      confirmedGuests: projectGuests.filter(g => g.rsvpStatus === 'confirmed').length,
      totalBudget: projectBudgetItems.reduce((sum, item) => sum + parseFloat(item.estimatedCost || '0'), 0),
      spentBudget: projectBudgetItems.reduce((sum, item) => sum + parseFloat(item.actualCost || '0'), 0),
      totalVendors: projectVendors.length,
      bookedVendors: projectVendors.filter(v => v.contractSigned).length,
    };

    return {
      project,
      tasks: projectTasks,
      guests: projectGuests,
      budgetItems: projectBudgetItems,
      vendors: projectVendors,
      inspirationItems: projectInspirationItems,
      scheduleEvents: projectScheduleEvents,
      stats
    };
  } catch (error) {
    console.error('Error fetching project data for export:', error);
    throw new Error('Failed to fetch project data');
  }
}

export function generateExcelExport(data: ExportData): Buffer {
  const workbook = XLSX.utils.book_new();

  // Overview sheet
  const overviewData = [
    ['Wedding Planning Export', ''],
    ['Project Name', data.project.name],
    ['Wedding Date', data.project.date || 'Not set'],
    ['Export Date', new Date().toLocaleDateString()],
    [''],
    ['Statistics', ''],
    ['Total Tasks', data.stats.totalTasks],
    ['Completed Tasks', data.stats.completedTasks],
    ['Task Completion Rate', `${Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)}%`],
    ['Total Guests', data.stats.totalGuests],
    ['Confirmed Guests', data.stats.confirmedGuests],
    ['RSVP Rate', `${Math.round((data.stats.confirmedGuests / data.stats.totalGuests) * 100)}%`],
    ['Total Budget', `$${data.stats.totalBudget.toFixed(2)}`],
    ['Amount Spent', `$${data.stats.spentBudget.toFixed(2)}`],
    ['Budget Used', `${Math.round((data.stats.spentBudget / data.stats.totalBudget) * 100)}%`],
    ['Total Vendors', data.stats.totalVendors],
    ['Booked Vendors', data.stats.bookedVendors],
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  // Tasks sheet
  if (data.tasks.length > 0) {
    const tasksData = [
      ['Title', 'Description', 'Due Date', 'Priority', 'Completed', 'Created Date']
    ];
    data.tasks.forEach(task => {
      tasksData.push([
        task.title,
        task.description || '',
        task.dueDate || '',
        task.priority || 'medium',
        task.completedAt ? 'Yes' : 'No',
        task.createdAt
      ]);
    });
    const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');
  }

  // Guests sheet
  if (data.guests.length > 0) {
    const guestsData = [
      ['Name', 'Email', 'Phone', 'Group', 'RSVP Status', 'Dietary Restrictions', 'Plus One', 'Hotel Info']
    ];
    data.guests.forEach(guest => {
      guestsData.push([
        guest.name,
        guest.email || '',
        guest.phone || '',
        guest.group || '',
        guest.rsvpStatus || 'pending',
        guest.dietaryRestrictions || '',
        guest.plusOne ? 'Yes' : 'No',
        guest.hotelInfo || ''
      ]);
    });
    const guestsSheet = XLSX.utils.aoa_to_sheet(guestsData);
    XLSX.utils.book_append_sheet(workbook, guestsSheet, 'Guests');
  }

  // Budget sheet
  if (data.budgetItems.length > 0) {
    const budgetData = [
      ['Category', 'Item', 'Estimated Cost', 'Actual Cost', 'Vendor', 'Payment Status', 'Notes']
    ];
    data.budgetItems.forEach(item => {
      budgetData.push([
        item.category,
        item.itemName,
        `$${parseFloat(item.estimatedCost || '0').toFixed(2)}`,
        `$${parseFloat(item.actualCost || '0').toFixed(2)}`,
        item.vendor || '',
        item.paymentStatus || 'unpaid',
        item.notes || ''
      ]);
    });
    const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(workbook, budgetSheet, 'Budget');
  }

  // Vendors sheet
  if (data.vendors.length > 0) {
    const vendorsData = [
      ['Name', 'Category', 'Email', 'Phone', 'Quote', 'Status', 'Contract Signed', 'Notes']
    ];
    data.vendors.forEach(vendor => {
      vendorsData.push([
        vendor.name,
        vendor.category,
        vendor.email || '',
        vendor.phone || '',
        vendor.quote ? `$${parseFloat(vendor.quote).toFixed(2)}` : '',
        vendor.status || 'researching',
        vendor.contractSigned ? 'Yes' : 'No',
        vendor.notes || ''
      ]);
    });
    const vendorsSheet = XLSX.utils.aoa_to_sheet(vendorsData);
    XLSX.utils.book_append_sheet(workbook, vendorsSheet, 'Vendors');
  }

  // Schedule sheet
  if (data.scheduleEvents.length > 0) {
    const scheduleData = [
      ['Title', 'Date', 'Start Time', 'End Time', 'Location', 'Description', 'Type']
    ];
    data.scheduleEvents.forEach(event => {
      scheduleData.push([
        event.title,
        event.date,
        event.startTime || '',
        event.endTime || '',
        event.location || '',
        event.description || '',
        event.type || 'event'
      ]);
    });
    const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule');
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export async function sendExportEmail(
  toEmail: string,
  projectName: string,
  exportFormat: 'excel' | 'pdf',
  attachmentBuffer: Buffer,
  fromEmail: string = 'noreply@planhaus.com'
): Promise<boolean> {
  if (!mailService) {
    throw new Error('Email service not configured. Please set SENDGRID_API_KEY environment variable.');
  }

  const fileExtension = exportFormat === 'excel' ? 'xlsx' : 'pdf';
  const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_wedding_export.${fileExtension}`;

  try {
    await mailService.send({
      to: toEmail,
      from: fromEmail,
      subject: `Your Wedding Planning Export - ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #be185d;">Your Wedding Planning Export</h2>
          <p>Hello!</p>
          <p>Your complete wedding planning data for <strong>${projectName}</strong> is attached to this email.</p>
          <p>This export includes:</p>
          <ul>
            <li>✅ Complete task list and timeline</li>
            <li>👥 Guest list with RSVP status</li>
            <li>💰 Budget breakdown and expenses</li>
            <li>🏢 Vendor contacts and booking status</li>
            <li>📅 Wedding day schedule</li>
            <li>📊 Planning statistics and progress</li>
          </ul>
          <p>The data is organized in easy-to-read sheets/sections for your convenience.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This export was generated from PlanHaus on ${new Date().toLocaleDateString()}.
            <br>
            Happy planning! 💕
          </p>
        </div>
      `,
      attachments: [
        {
          content: attachmentBuffer.toString('base64'),
          filename: fileName,
          type: exportFormat === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });
    return true;
  } catch (error) {
    console.error('Error sending export email:', error);
    return false;
  }
}

export function generateTextSummary(data: ExportData): string {
  let summary = `WEDDING PLANNING EXPORT\n`;
  summary += `========================\n\n`;
  summary += `Project: ${data.project.name}\n`;
  summary += `Wedding Date: ${data.project.date || 'Not set'}\n`;
  summary += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
  
  summary += `PLANNING PROGRESS\n`;
  summary += `-----------------\n`;
  summary += `Tasks: ${data.stats.completedTasks}/${data.stats.totalTasks} completed (${Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)}%)\n`;
  summary += `Guests: ${data.stats.confirmedGuests}/${data.stats.totalGuests} confirmed (${Math.round((data.stats.confirmedGuests / data.stats.totalGuests) * 100)}%)\n`;
  summary += `Budget: $${data.stats.spentBudget.toFixed(2)}/$${data.stats.totalBudget.toFixed(2)} used (${Math.round((data.stats.spentBudget / data.stats.totalBudget) * 100)}%)\n`;
  summary += `Vendors: ${data.stats.bookedVendors}/${data.stats.totalVendors} booked\n\n`;

  if (data.tasks.length > 0) {
    summary += `UPCOMING TASKS\n`;
    summary += `--------------\n`;
    const incompleteTasks = data.tasks.filter(t => !t.completed).slice(0, 5);
    incompleteTasks.forEach(task => {
      summary += `• ${task.title}${task.dueDate ? ` (Due: ${task.dueDate})` : ''}\n`;
    });
    summary += `\n`;
  }

  if (data.vendors.length > 0) {
    summary += `VENDOR STATUS\n`;
    summary += `-------------\n`;
    data.vendors.forEach(vendor => {
      summary += `• ${vendor.name} (${vendor.category}) - ${vendor.status || 'researching'}\n`;
    });
    summary += `\n`;
  }

  return summary;
}