let applications = [];
let nextId = 1;

// Load applications from localStorage on page load
function loadApplications() {
    const saved = localStorage.getItem('jobApplications');
    if (saved) {
        applications = JSON.parse(saved);
        nextId = applications.length > 0 ? Math.max(...applications.map(app => app.id)) + 1 : 1;
    }
    renderApplications();
    updateStats();
}

// Save applications to localStorage
function saveApplications() {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
}

// Initialize with today's date
document.getElementById('dateApplied').value = new Date().toISOString().split('T')[0];

// Form submission to add new application
document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const application = {
        id: nextId++,
        jobTitle: document.getElementById('jobTitle').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        salaryRange: document.getElementById('salaryRange').value,
        applicationLink: document.getElementById('applicationLink').value,
        dateApplied: document.getElementById('dateApplied').value,
        notes: document.getElementById('notes').value,
        status: "Applied",
        specificSalary: ""
    };
    applications.push(application);
    saveApplications();
    renderApplications();
    updateStats();
    e.target.reset();
    document.getElementById('dateApplied').value = new Date().toISOString().split('T')[0];
});

// Render applications with search and filter
function renderApplications() {
    const list = document.getElementById('applicationsList');
    list.innerHTML = '';
    const searchTerm = document.getElementById('searchApp').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;

    let filteredApps = applications.filter(app => {
        const matchesSearch = app.jobTitle.toLowerCase().includes(searchTerm) ||
            app.company.toLowerCase().includes(searchTerm) ||
            (app.location && app.location.toLowerCase().includes(searchTerm)) ||
            (app.notes && app.notes.toLowerCase().includes(searchTerm));
        const matchesStatus = !filterStatus || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    filteredApps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'application-card';
        card.innerHTML = `
            <div class="app-header">
                <div>
                    <input type="checkbox" class="select-app" data-id="${app.id}">
                    <div class="app-title">${app.jobTitle}</div>
                    <div class="app-company">${app.company}</div>
                </div>
                <span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span>
            </div>
            <div class="app-details">
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${app.location || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Salary Range</span>
                    <span class="detail-value">${app.salaryRange || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Specific Salary</span>
                    <span class="detail-value">${app.specificSalary || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date Applied</span>
                    <span class="detail-value">${app.dateApplied}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Link</span>
                    <span class="detail-value">${app.applicationLink ? `<a href="${app.applicationLink}" target="_blank">${app.applicationLink}</a>` : '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Notes</span>
                    <span class="detail-value">${app.notes || '—'}</span>
                </div>
            </div>
            <div class="app-actions">
                <button class="btn-small btn-danger" onclick="deleteApplication(${app.id})">Delete</button>
                <button class="btn-small" onclick="showStatusUpdate(${app.id})">Update Status</button>
            </div>
            <div class="status-update" id="statusUpdate-${app.id}" style="display: none;">
                <div class="update-grid">
                    <div class="form-group">
                        <label>Status</label>
                        <select class="status-select" data-id="${app.id}">
                            <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                            <option value="Interviewing" ${app.status === 'Interviewing' ? 'selected' : ''}>Interviewing</option>
                            <option value="Offer" ${app.status === 'Offer' ? 'selected' : ''}>Offer</option>
                            <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            <option value="Accepted" ${app.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Specific Salary</label>
                        <input type="text" class="specific-salary" data-id="${app.id}" placeholder="e.g., $90,000" value="${app.specificSalary || ''}">
                    </div>
                    <div class="form-group">
                        <button class="btn-small" onclick="saveStatus(${app.id})">Update</button>
                        <button class="btn-small btn-danger" onclick="hideStatusUpdate(${app.id})">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

// Show status update form
window.showStatusUpdate = function(id) {
    document.querySelectorAll('.status-update').forEach(el => el.style.display = 'none');
    document.getElementById(`statusUpdate-${id}`).style.display = 'block';
};

// Hide status update form
window.hideStatusUpdate = function(id) {
    document.getElementById(`statusUpdate-${id}`).style.display = 'none';
};

// Save status (and specific salary)
window.saveStatus = function(id) {
    const app = applications.find(a => a.id === id);
    const status = document.querySelector(`.status-select[data-id="${id}"]`).value;
    app.status = status;
    app.specificSalary = document.querySelector(`.specific-salary[data-id="${id}"]`).value || '';
    saveApplications();
    renderApplications();
    updateStats();
    hideStatusUpdate(id);
};

// Delete application
window.deleteApplication = function(id) {
    applications = applications.filter(app => app.id !== id);
    saveApplications();
    renderApplications();
    updateStats();
};

// Delete selected applications
document.getElementById('deleteSelected').addEventListener('click', function() {
    const selected = Array.from(document.querySelectorAll('.select-app:checked')).map(el => parseInt(el.dataset.id));
    applications = applications.filter(app => !selected.includes(app.id));
    saveApplications();
    renderApplications();
    updateStats();
});

// Search and filter listeners
document.getElementById('searchApp').addEventListener('input', renderApplications);
document.getElementById('filterStatus').addEventListener('change', renderApplications);

// Update all statistics and dashboard sections
function updateStats() {
    const total = applications.length;
    const interviewing = applications.filter(a => a.status === 'Interviewing').length;
    const accepted = applications.filter(a => a.status === 'Accepted').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;
    const offer = applications.filter(a => a.status === 'Offer').length;
    const applied = applications.filter(a => a.status === 'Applied').length;

    // Interviewed = Interviewing + Accepted + Offer
    const interviewed = interviewing + accepted + offer;

    const responseRate = total > 0 ? Math.round((interviewed + rejected) / total * 100) : 0;
    const successRate = total > 0 ? Math.round(accepted / total * 100) : 0;
    const interviewRate = total > 0 ? Math.round(interviewed / total * 100) : 0;
    const rejectionRate = total > 0 ? Math.round(rejected / total * 100) : 0;
    const pendingCount = applied;

    // Salary insights
    const offers = applications.filter(a => a.specificSalary && (a.status === 'Accepted' || a.status === 'Offer'));
    const salaries = offers.map(a => {
        const num = parseFloat(a.specificSalary.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
    });
    const avgOffered = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) / salaries.length : 0;
    const highestOffer = salaries.length > 0 ? Math.max(...salaries) : 0;
    const totalPotential = salaries.length > 0 ? salaries.reduce((a, b) => a + b, 0) : 0;

    // Application breakdown
    const thisWeekCount = applications.filter(a => {
        const appDate = new Date(a.dateApplied);
        if (isNaN(appDate.getTime())) return false;
        const now = new Date();
        const diffDays = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }).length;
    const thisMonthCount = applications.filter(a => {
        const appDate = new Date(a.dateApplied);
        if (isNaN(appDate.getTime())) return false;
        const now = new Date();
        const diffDays = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    }).length;

    // Average per week
    const appDates = applications.map(a => new Date(a.dateApplied).getTime()).filter(t => !isNaN(t));
    const minDate = appDates.length > 0 ? Math.min(...appDates) : new Date().getTime();
    const weeksSinceFirst = (new Date().getTime() - minDate) / (1000 * 60 * 60 * 24 * 7);
    let avgPerWeek;
    if (weeksSinceFirst >= 1) {
        avgPerWeek = (total / weeksSinceFirst).toFixed(1);
    } else if (total > 0) {
        avgPerWeek = `${total} (since start)`;
    } else {
        avgPerWeek = "0";
    }

    // Days since last application
    const lastAppDate = appDates.length > 0 ? Math.max(...appDates) : null;
    const daysSinceLast = lastAppDate ? Math.floor((new Date() - new Date(lastAppDate)) / (1000 * 60 * 60 * 24)) : '-';

    // Location analysis
    const locations = {};
    applications.forEach(a => {
        if (a.location) {
            locations[a.location] = (locations[a.location] || 0) + 1;
        }
    });
    const locationStatsList = Object.entries(locations).map(([loc, count]) => 
        `<li><span>${loc}:</span> <strong>${count}</strong></li>`
    ).join('') || '<li><span>No data yet</span></li>';

    // Update dashboard
    document.getElementById('totalApps').textContent = total;
    document.getElementById('interviewingCount').textContent = interviewing;
    document.getElementById('acceptedCount').textContent = accepted;
    document.getElementById('rejectedCount').textContent = rejected;
    document.getElementById('responseRate').textContent = `${responseRate}%`;
    document.getElementById('successRate').textContent = `${successRate}%`;
    document.getElementById('thisWeekCount').textContent = thisWeekCount;
    document.getElementById('thisMonthCount').textContent = thisMonthCount;
    document.getElementById('avgPerWeek').textContent = avgPerWeek;
    document.getElementById('daysSinceLast').textContent = daysSinceLast;
    document.getElementById('avgOffered').textContent = avgOffered > 0 ? `$${avgOffered.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-';
    document.getElementById('highestOffer').textContent = highestOffer > 0 ? `$${highestOffer.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-';
    document.getElementById('totalPotential').textContent = totalPotential > 0 ? `$${totalPotential.toLocaleString('en-US', {maximumFractionDigits: 0})}` : '-';
    document.getElementById('interviewRate').textContent = `${interviewRate}%`;
    document.getElementById('rejectionRate').textContent = `${rejectionRate}%`;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('locationStats').innerHTML = locationStatsList;
}

// Load saved applications on page load
loadApplications();
