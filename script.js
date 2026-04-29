
        let users = {};
        let currentUser = null;
        let applications = {};

        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
        }

        function showMessage(elementId, message, type) {
            const messageEl = document.getElementById(elementId);
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value.toLowerCase();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password.length < 6) {
                showMessage('registerMessage', 'Password must be at least 6 characters long', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('registerMessage', 'Passwords do not match', 'error');
                return;
            }

            if (users[email]) {
                showMessage('registerMessage', 'Email already registered', 'error');
                return;
            }

            users[email] = { name, password };
            applications[email] = [];
            
            showMessage('registerMessage', 'Account created successfully! Redirecting to login...', 'success');
            
            setTimeout(() => {
                document.getElementById('registerForm').reset();
                showPage('loginPage');
            }, 1500);
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.toLowerCase();
            const password = document.getElementById('loginPassword').value;

            if (!users[email]) {
                showMessage('loginMessage', 'Email not found. Please register first.', 'error');
                return;
            }

            if (users[email].password !== password) {
                showMessage('loginMessage', 'Incorrect password', 'error');
                return;
            }

            currentUser = email;
            document.getElementById('userName').textContent = users[email].name;
            document.getElementById('loginForm').reset();
            showPage('trackerPage');
            loadApplications();
        });

        document.getElementById('goToRegister').addEventListener('click', () => {
            showPage('registerPage');
        });

        document.getElementById('goToLogin').addEventListener('click', () => {
            showPage('loginPage');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            currentUser = null;
            showPage('loginPage');
        });

        function mergeSort(arr, compareFn) {
            if (arr.length <= 1) return arr;

            const mid = Math.floor(arr.length / 2);
            const left = mergeSort(arr.slice(0, mid), compareFn);
            const right = mergeSort(arr.slice(mid), compareFn);

            return merge(left, right, compareFn);
        }

        function merge(left, right, compareFn) {
            const result = [];
            let i = 0, j = 0;

            while (i < left.length && j < right.length) {
                if (compareFn(left[i], right[j]) <= 0) {
                    result.push(left[i++]);
                } else {
                    result.push(right[j++]);
                }
            }

            return result.concat(left.slice(i)).concat(right.slice(j));
        }

        document.getElementById('applicationForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const application = {
                id: Date.now(),
                company: document.getElementById('company').value,
                position: document.getElementById('position').value,
                date: document.getElementById('date').value,
                status: document.getElementById('status').value,
                notes: document.getElementById('notes').value
            };

            applications[currentUser].push(application);
            document.getElementById('applicationForm').reset();
            document.getElementById('date').valueAsDate = new Date();
            loadApplications();
        });

        function loadApplications() {
            const container = document.getElementById('applicationsContainer');
            const loadingMessage = document.getElementById('loadingMessage');
            
            loadingMessage.style.display = 'block';
            container.innerHTML = '';

            setTimeout(() => {
                loadingMessage.style.display = 'none';
                
                let apps = [...(applications[currentUser] || [])];
                
                const filterStatus = document.getElementById('filterStatus').value;
                if (filterStatus !== 'all') {
                    apps = apps.filter(app => app.status === filterStatus);
                }

                const sortBy = document.getElementById('sortBy').value;
                let compareFn;

                switch (sortBy) {
                    case 'date':
                        compareFn = (a, b) => new Date(b.date) - new Date(a.date);
                        break;
                    case 'date_asc':
                        compareFn = (a, b) => new Date(a.date) - new Date(b.date);
                        break;
                    case 'company':
                        compareFn = (a, b) => a.company.localeCompare(b.company);
                        break;
                    case 'company_desc':
                        compareFn = (a, b) => b.company.localeCompare(a.company);
                        break;
                    case 'status':
                        compareFn = (a, b) => a.status.localeCompare(b.status);
                        break;
                }

                apps = mergeSort(apps, compareFn);

                const allApps = applications[currentUser] || [];
                document.getElementById('totalCount').textContent = allApps.length;
                document.getElementById('appliedCount').textContent = allApps.filter(a => a.status === 'Applied').length;
                document.getElementById('interviewCount').textContent = allApps.filter(a => a.status === 'Interview').length;

                if (apps.length === 0) {
                    container.innerHTML = '<div class="loading">No applications found. Add your first application above!</div>';
                    return;
                }

                apps.forEach(app => {
                    const card = document.createElement('div');
                    card.className = 'application-card';
                    card.innerHTML = `
                        <div class="card-header">
                            <div class="company-name">${app.company}</div>
                            <span class="status-badge status-${app.status}">${app.status}</span>
                        </div>
                        <div class="position-name">${app.position}</div>
                        <div class="date">📅 Applied: ${new Date(app.date).toLocaleDateString()}</div>
                        ${app.notes ? `<div class="notes">${app.notes}</div>` : ''}
                        <div class="card-actions">
                            <button class="btn-delete" onclick="deleteApplication(${app.id})">Delete</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }, 500);
        }

        function deleteApplication(id) {
            if (confirm('Are you sure you want to delete this application?')) {
                applications[currentUser] = applications[currentUser].filter(app => app.id !== id);
                loadApplications();
            }
        }

        document.getElementById('applyFilters').addEventListener('click', loadApplications);

        document.getElementById('date').valueAsDate = new Date();
  