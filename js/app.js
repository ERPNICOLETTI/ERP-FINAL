document.addEventListener('DOMContentLoaded', () => {
    initChart();
    renderTransactions();
    setupModals();
});

// Mock Initial Data for Transactions
const transactions = [
    { id: 1, entity: 'karlota', type: 'ingreso', amount: 45000, desc: 'Venta Mostrador Lote A', date: 'Hoy, 14:30' },
    { id: 2, entity: 'karlota', type: 'egreso', amount: -15000, desc: 'Pago a Proveedor (Insumos)', date: 'Hoy, 10:15' },
    { id: 3, entity: 'karlota', type: 'transferencia', amount: -50000, desc: 'Retiro Socio - Joaquín', date: 'Ayer, 18:20' },
    { id: 4, entity: 'joaquin', type: 'ingreso', amount: 50000, desc: 'Ingreso por Retiro de Karlota', date: 'Ayer, 18:20' },
    { id: 5, entity: 'jorgelina', type: 'egreso', amount: -8500, desc: 'Gastos Administrativos / Compra', date: 'Ayer, 09:10' },
    { id: 6, entity: 'karlota', type: 'ingreso', amount: 125000, desc: 'Venta Mayorista (Cliente C)', date: '2 Mar, 11:00' },
];

const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

function setupModals() {
    const btnNew = document.getElementById('btn-new-transaction');
    const modalOverlay = document.getElementById('transactionModal');
    const btnClose = document.getElementById('closeModal');
    const form = document.getElementById('transactionForm');
    const entitySelect = document.getElementById('t-entity');
    const accountSelect = document.getElementById('t-account');
    const typeSelect = document.getElementById('t-type');
    const categorySelect = document.getElementById('t-category');

    const accountsData = {
        joaquin: [
            'CA$ Hipotecario', 'USD Hipotecario', 'CA$ Credicoop',
            'MercadoPago', 'Billetera (Efectivo)'
        ],
        jorgelina: [
            'CA$ Chubut', 'CC$ Chubut', 'CA$ Galicia', 'USD Galicia',
            'CC Galicia', 'MercadoPago', 'Naranja', 'Billetera (Efectivo)'
        ],
        karlota: [
            'CA$ Chubut', 'CC$ Chubut', 'CA$ Galicia', 'USD Galicia',
            'CC Galicia', 'MercadoPago', 'Naranja', 'Billetera (Efectivo)'
        ]
    };

    const incomeCategories = {
        joaquin: ['Sueldo (💼)', 'Comisión (💰)', 'Alquiler (🏠)', 'Inversiones (📈)', 'Regalos (🎁)', 'Otros Ingresos'],
        jorgelina: ['Sueldo (💼)', 'Inversiones (📈)', 'Regalos (🎁)', 'Otros Ingresos'],
        karlota: ['Ventas (🧾)', 'Transferencia recibida (💸)', 'Intereses (🏦)', 'Reembolsos (📦)', 'Aporte Extraordinario', 'Otros Ingresos']
    };

    const expenseCategories = {
        joaquin: [
            'Comida (🍔)', 'Transporte (🚗)', 'Vivienda (🏠)', 'Servicios (💡)',
            'Impuestos (🧾)', 'Salud (🏥)', 'Educación (🎓)', 'Ocio (🎮)',
            'Compras (🛒)', 'Ropa (👕)', 'Tecnología (💻)', 'Deportes (🏋️)',
            'Estética (💅)', 'Mascotas (🐶)', 'Pago Tarjeta (💳)', 'Otros (📦)'
        ],
        jorgelina: [
            'Comida (🍔)', 'Transporte (🚗)', 'Vivienda (🏠)', 'Servicios (💡)',
            'Impuestos (🧾)', 'Salud (🏥)', 'Educación (🎓)', 'Ocio (🎮)',
            'Compras (🛒)', 'Ropa (👕)', 'Tecnología (💻)', 'Deportes (🏋️)',
            'Estética (💅)', 'Mascotas (🐶)', 'Pago Tarjeta (💳)', 'Otros (📦)'
        ],
        karlota: [
            'Proveedores Insumos', 'Mercadería Local', 'Alquiler Local (🏠)',
            'Sueldos (💸)', 'Impuestos (🧾)', 'Servicios (💡)', 'Mantenimiento (📦)', 'Otros Egresos'
        ]
    };

    function updateAccounts() {
        const entity = entitySelect.value;
        const accounts = accountsData[entity] || [];

        accountSelect.innerHTML = '<option value="" disabled selected>Selecciona una cuenta</option>';
        accounts.forEach(acc => {
            const opt = document.createElement('option');
            opt.value = acc.toLowerCase().replace(/\s+/g, '-');
            opt.textContent = acc;
            accountSelect.appendChild(opt);
        });
    }

    function updateCategories() {
        const entity = entitySelect.value;
        const type = typeSelect.value;
        let categories = [];

        if (type === 'ingreso') {
            categories = incomeCategories[entity] || ['Otros Ingresos'];
        } else if (type === 'egreso') {
            categories = expenseCategories[entity] || ['Otros Egresos'];
        } else {
            categories = ['Retiro de Socio', 'Aporte de Socio'];
        }

        categorySelect.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.toLowerCase().replace(/\s+/g, '-');
            opt.textContent = cat;
            categorySelect.appendChild(opt);
        });
    }

    entitySelect.addEventListener('change', () => {
        updateAccounts();
        updateCategories();
    });

    typeSelect.addEventListener('change', updateCategories);

    // Open Modal with a smooth display and opacity fade
    btnNew.addEventListener('click', () => {
        updateAccounts(); // Cargar cuentas de la entidad por defecto
        updateCategories(); // Cargar categorías por defecto
        modalOverlay.style.display = 'flex';
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
        }, 10);
    });

    // Close Modal
    btnClose.addEventListener('click', closeAndClear);

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeAndClear();
    });

    // Submit form (mock saving)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const entity = document.getElementById('t-entity').value;
        const type = document.getElementById('t-type').value;
        const amountValue = parseFloat(document.getElementById('t-amount').value);
        const desc = document.getElementById('t-desc').value;
        const account = accountSelect.options[accountSelect.selectedIndex]?.text || '';
        const category = categorySelect.options[categorySelect.selectedIndex]?.text || '';

        // Define amount sign based on type
        const amount = (type === 'egreso' || type === 'transferencia') ? -amountValue : amountValue;

        // Add to array
        transactions.unshift({
            id: Date.now(),
            entity: entity,
            account: account,
            category: category,
            type: type,
            amount: amount,
            desc: desc,
            date: 'Ahora mismo'
        });

        // Re-render
        renderTransactions();

        // Close modal
        closeAndClear();

        // Small feedback
        setTimeout(() => {
            alert('¡Transacción registrada exitosamente en el prototipo!');
        }, 300);
    });

    function closeAndClear() {
        modalOverlay.style.opacity = '0';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            form.reset();
        }, 300);
    }
}

function renderTransactions() {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';

    transactions.forEach(t => {
        let entityColor, entityIcon, entityName;

        if (t.entity === 'karlota') {
            entityColor = 'var(--color-karlota)';
            entityIcon = 'fa-shop';
            entityName = 'Lo de Karlota';
        } else if (t.entity === 'joaquin') {
            entityColor = 'var(--color-joaquin)';
            entityIcon = 'fa-user';
            entityName = 'Joaquín';
        } else {
            entityColor = 'var(--color-jorgelina)';
            entityIcon = 'fa-user';
            entityName = 'Jorgelina';
        }

        const isPositive = t.amount > 0;
        const amountClass = isPositive ? 'text-positive' : 'text-negative';

        const item = document.createElement('div');
        item.className = 'transaction-item';
        // Add inline style using hex/rgb approximation since CSS var requires computed, but here we can just use opacity in css or inject raw colors. We inject an inline block for the background
        item.innerHTML = `
            <div class="t-icon" style="background-color: ${entityColor}; opacity: 0.9; color: white;">
                <i class="fa-solid ${entityIcon}"></i>
            </div>
            <div class="t-details">
                <div class="t-title">${t.desc}</div>
                <div class="t-subtitle">
                    ${entityName} 
                    ${t.account ? '&bull; ' + t.account : ''} 
                    ${t.category ? '&bull; <span style="color: var(--color-joaquin)">' + t.category + '</span>' : ''}
                    &bull; ${t.date}
                </div>
            </div>
            <div class="t-amount ${amountClass}">${isPositive ? '+' : ''}${formatMoney(t.amount)}</div>
        `;
        list.appendChild(item);
    });
}

function initChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');

    // Create Gradient Data
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); // Emerald Green
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['25 Feb', '26 Feb', '27 Feb', '28 Feb', '1 Mar', '2 Mar', '3 Mar'],
            datasets: [{
                label: 'Ingresos Karlota',
                data: [120000, 150000, 180000, 155000, 210000, 280000, 320000],
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4, // Smooth curvy line
                fill: true,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { family: 'Inter', size: 13 },
                    bodyFont: { family: 'Outfit', size: 15, weight: 'bold' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 11 },
                        callback: function (value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                },
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
                }
            }
        }
    });
}
