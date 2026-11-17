import React, { useEffect, useMemo, useState } from "react";
import {
  Bell, ChefHat, Check, CheckCircle2, ClipboardList, Clock, Eye,
  Flag, Leaf, LogOut, Menu, RefreshCw, Settings, Utensils, X,
  Trash2, CookingPot, CircleCheck, Activity, Timer, Search
} from "lucide-react";

const INITIAL_ORDERS = [
  {
    id: "ORD-101", table: 5, status: "NEW", createdAt: Date.now() - 4 * 60000,
    items: [
      { name: "Chicken Biryani", quantity: 2, note: "Less spicy" },
      { name: "Fresh Lime Juice", quantity: 1 }
    ]
  },
  {
    id: "ORD-102", table: 8, status: "NEW", createdAt: Date.now() - 2 * 60000,
    items: [
      { name: "Margherita Pizza", quantity: 1 },
      { name: "Caesar Salad", quantity: 1 }
    ]
  },
  {
    id: "ORD-099", table: 8, status: "PREPARING", createdAt: Date.now() - 11 * 60000,
    acceptedAt: Date.now() - 8 * 60000, preparingAt: Date.now() - 7 * 60000,
    items: [{ name: "Margherita Pizza", quantity: 1 }, { name: "Caesar Salad", quantity: 1 }]
  },
  {
    id: "ORD-098", table: 7, status: "READY", createdAt: Date.now() - 14 * 60000,
    readyAt: Date.now() - 2 * 60000,
    items: [{ name: "Veggie Pizza", quantity: 1 }]
  },
  {
    id: "ORD-097", table: 6, status: "COLLECTED", createdAt: Date.now() - 25 * 60000,
    collectedAt: Date.now() - 4 * 60000,
    items: [{ name: "Beef Burger", quantity: 1 }, { name: "Iced Tea", quantity: 1 }]
  }
];

const STAGES = [
  { key: "NEW", title: "New Orders", icon: Bell, color: "new" },
  { key: "PREPARING", title: "In Preparation", icon: CookingPot, color: "preparing" },
  { key: "READY", title: "Ready to Serve", icon: CheckCircle2, color: "ready" },
  { key: "COLLECTED", title: "Completed", icon: Flag, color: "completed" }
];

const timeLabel = (timestamp) => new Date(timestamp).toLocaleTimeString([], {
  hour: "2-digit", minute: "2-digit"
});

function Sidebar({ onRefresh, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><ChefHat size={38} strokeWidth={1.8} /></div>
          <div className="brand-name">Luxmor Cafe</div>
          <div className="brand-tagline">Good Food. Good Mood.</div>
        </div>
        <nav className="side-nav">
          <button className="nav-item active"><ChefHat size={19} /> Kitchen Dashboard</button>
          <button className="nav-item"><Settings size={19} /> Settings</button>
          <button className="nav-item"><LogOut size={19} /> Logout</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="live-dot" />
          <div><strong>Live Updates</strong><span>Demo mode active</span></div>
          <button className="icon-button sidebar-refresh" onClick={onRefresh} title="Refresh demo" aria-label="Refresh demo">
            <RefreshCw size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}

function DashboardHeader({ onMenu }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="dashboard-header">
      <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open menu"><Menu /></button>
      <div className="header-copy">
        <div className="eyebrow"><Leaf size={15} /> LUXMOR CAFE · KITCHEN</div>
        <h1>Kitchen Dashboard</h1>
        <p>Manage kitchen orders in real-time</p>
      </div>
      <div className="header-right">
        <div className="online-pill"><span className="live-dot" /> Kitchen Online</div>
        <div className="header-clock"><Clock size={23} /><div><strong>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong><span>{now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</span></div></div>
        <div className="chef-avatar"><ChefHat size={25} /></div>
      </div>
    </header>
  );
}

function SummaryCards({ orders }) {
  const counts = {
    NEW: orders.filter(o => o.status === "NEW").length,
    PREPARING: orders.filter(o => o.status === "PREPARING").length,
    READY: orders.filter(o => o.status === "READY").length,
    TODAY: orders.length
  };
  const cards = [
    { title: "New Orders", value: counts.NEW, icon: ClipboardList, theme: "summary-new" },
    { title: "In Preparation", value: counts.PREPARING, icon: CookingPot, theme: "summary-preparing" },
    { title: "Ready to Serve", value: counts.READY, icon: CheckCircle2, theme: "summary-ready" },
    { title: "Today's Orders", value: counts.TODAY, icon: Flag, theme: "summary-total" }
  ];
  return <section className="summary-grid">
    {cards.map(({ title, value, icon: Icon, theme }) => (
      <article className={`summary-card ${theme}`} key={title}>
        <div className="summary-icon"><Icon size={25} /></div>
        <div><strong className="summary-number">{value}</strong><span>{title}</span></div>
      </article>
    ))}
  </section>;
}

function OrderCard({ order, onAction, onView, onCancel }) {
  const [elapsed, setElapsed] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setElapsed(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const started = order.preparingAt || order.acceptedAt || order.createdAt;
  const minutes = Math.max(0, Math.floor((elapsed - started) / 60000));
  const statusAction = {
    NEW: { label: "Accept", icon: Check, action: "accept" },
    PREPARING: { label: "Mark Ready", icon: Check, action: "ready" },
    READY: { label: "Notify Staff", icon: Bell, action: "collect" }
  }[order.status];

  return (
    <article className={`order-card order-${order.status.toLowerCase()}`} key={order.id}>
      <div className="order-topline">
        <span className="order-id">{order.id}</span>
        <span className="order-time"><Clock size={13} /> {timeLabel(order.createdAt)}</span>
      </div>
      <div className="order-table"><ClipboardList size={16} /><strong>Table {order.table}</strong>
        {order.status === "PREPARING" && <span className="elapsed"><Timer size={13} /> {minutes} min</span>}
      </div>
      <div className="order-items">
        {order.items.map((item, index) => (
          <div className="order-item" key={`${item.name}-${index}`}>
            <Utensils size={14} />
            <span>{item.name}{item.note && <small className="item-note"> · {item.note}</small>}</span>
            <strong>×{item.quantity}</strong>
          </div>
        ))}
      </div>
      {order.status === "NEW" && <div className="new-badge"><span className="pulse-dot" /> Just received</div>}
      {order.status === "READY" && <div className="ready-message"><CircleCheck size={15} /> Waiting for staff pickup</div>}
      {order.status === "COLLECTED" && <div className="collected-message"><CheckCircle2 size={15} /> Collected {order.collectedAt ? `at ${timeLabel(order.collectedAt)}` : ""}</div>}
      <div className="order-actions">
        {statusAction && <button className={`action-primary ${order.status.toLowerCase()}`} onClick={() => onAction(order.id, statusAction.action)}>
          <statusAction.icon size={15} /> {statusAction.label}
        </button>}
        {order.status === "NEW" && <button className="action-cancel" onClick={() => onCancel(order)}><Trash2 size={14} /> Cancel</button>}
        {order.status === "READY" && <button className="action-secondary" onClick={() => onAction(order.id, "collect")}><Check size={15} /> Collected</button>}
        {order.status === "COLLECTED" && <span className="completed-tag">Completed</span>}
        <button className="action-view" onClick={() => onView(order)}><Eye size={15} /> View</button>
      </div>
    </article>
  );
}

function OrderColumn({ stage, orders, onAction, onView, onCancel }) {
  const Icon = stage.icon;
  return (
    <section className={`order-column column-${stage.color}`}>
      <div className="column-heading">
        <Icon size={19} />
        <h2>{stage.title}</h2>
        <span className="column-count">{orders.length}</span>
      </div>
      <div className="column-body">
        {orders.length ? orders.map(order => (
          <OrderCard key={order.id} order={order} onAction={onAction} onView={onView} onCancel={onCancel} />
        )) : (
          <div className="empty-state"><div className="empty-icon"><CheckCircle2 size={22} /></div><strong>All clear</strong><span>No orders in this stage</span></div>
        )}
      </div>
    </section>
  );
}

function OrderFlow({ orders }) {
  const flow = [
    ["New", orders.filter(o => o.status === "NEW").length, "flow-new"],
    ["Accepted", orders.filter(o => o.acceptedAt).length, "flow-accepted"],
    ["Preparing", orders.filter(o => o.status === "PREPARING" || o.preparingAt).length, "flow-preparing"],
    ["Ready", orders.filter(o => o.status === "READY" || o.readyAt).length, "flow-ready"],
    ["Completed", orders.filter(o => o.status === "COLLECTED").length, "flow-completed"]
  ];
  return <section className="panel order-flow">
    <div className="panel-heading"><Activity size={18} /><h3>Order Flow Today</h3></div>
    <div className="flow-track">
      {flow.map(([label, value, theme], index) => (
        <React.Fragment key={label}>
          <div className="flow-step"><div className={`flow-number ${theme}`}>{value}</div><span>{label}</span></div>
          {index < flow.length - 1 && <div className="flow-arrow">→</div>}
        </React.Fragment>
      ))}
    </div>
  </section>;
}

function RecentActivity({ activities }) {
  return <section className="panel recent-activity">
    <div className="panel-heading"><Bell size={18} /><h3>Recent Activity</h3><span className="panel-link">Latest</span></div>
    <div className="activity-list">
      {activities.length ? activities.slice(0, 5).map((activity, index) => (
        <div className="activity-row" key={`${activity.text}-${index}`}>
          <span className={`activity-symbol ${activity.type}`}><activity.icon size={13} /></span>
          <span className="activity-text">{activity.text}</span>
          <time>{timeLabel(activity.time)}</time>
        </div>
      )) : <div className="activity-empty">Activity will appear here.</div>}
    </div>
  </section>;
}

function CancelOrderModal({ order, onClose, onConfirm }) {
  if (!order) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        <div className="modal-danger-icon"><Trash2 size={25} /></div>
        <h2 id="cancel-title">Cancel Order?</h2>
        <p>Are you sure you want to cancel <strong>{order.id}</strong> for <strong>Table {order.table}</strong>?</p>
        <p className="modal-hint">This order will be marked as cancelled.</p>
        <div className="modal-actions">
          <button className="button-neutral" onClick={onClose}>No, Keep Order</button>
          <button className="button-danger" onClick={() => onConfirm(order.id)}>Yes, Cancel</button>
        </div>
      </section>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="confirm-modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        <div className="details-kicker">ORDER DETAILS</div>
        <h2 id="details-title">{order.id}</h2>
        <p className="details-table">Table {order.table} · {order.status.replace("_", " ")}</p>
        <div className="details-items">{order.items.map((item, index) => <div key={index}><span>{item.name}</span><strong>×{item.quantity}</strong></div>)}</div>
        <button className="button-neutral full-width" onClick={onClose}>Close</button>
      </section>
    </div>
  );
}

export default function App() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activities, setActivities] = useState([
    { text: "Order #ORD-098 is ready", type: "ready", icon: CheckCircle2, time: Date.now() - 2 * 60000 },
    { text: "Order #ORD-099 started preparing", type: "preparing", icon: CookingPot, time: Date.now() - 5 * 60000 },
    { text: "New order #ORD-102 received", type: "new", icon: Bell, time: Date.now() - 2 * 60000 }
  ]);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter(o => !term || o.id.toLowerCase().includes(term) || String(o.table).includes(term) ||
      o.items.some(item => item.name.toLowerCase().includes(term)));
  }, [orders, search]);

  const addActivity = (text, type, icon) => {
    setActivities(prev => [{ text, type, icon, time: Date.now() }, ...prev]);
  };

  const handleAction = (id, action) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const now = Date.now();

    if (action === "accept" && order.status === "NEW") {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "PREPARING", acceptedAt: now, preparingAt: now } : o));
      addActivity(`${id} accepted and preparation started`, "preparing", CookingPot);
    } else if (action === "ready" && order.status === "PREPARING") {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "READY", readyAt: now } : o));
      addActivity(`${id} is ready for staff`, "ready", CheckCircle2);
    } else if (action === "collect" && order.status === "READY") {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "COLLECTED", collectedAt: now } : o));
      addActivity(`${id} collected by staff`, "completed", Check);
    }
  };

  const confirmCancel = (id) => {
    const order = orders.find(o => o.id === id);
    if (!order || order.status !== "NEW") return;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELLED", cancelledAt: Date.now() } : o));
    addActivity(`${id} cancelled`, "cancelled", X);
    setCancelOrder(null);
  };

  const refreshDemo = () => {
    setOrders(INITIAL_ORDERS);
    setActivities([{ text: "Demo orders refreshed", type: "new", icon: RefreshCw, time: Date.now() }]);
    setSearch("");
  };

  const stageOrders = (key) => visibleOrders.filter(order => order.status === key);
  const cancelledCount = orders.filter(o => o.status === "CANCELLED").length;

  return (
    <div className="app-shell">
      <Sidebar onRefresh={refreshDemo} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main-content">
        <DashboardHeader onMenu={() => setMobileOpen(true)} />
        <div className="dashboard-content">
          <SummaryCards orders={orders.filter(o => o.status !== "CANCELLED")} />
          <div className="toolbar">
            <div className="toolbar-label"><span className="live-dot" /> Live kitchen orders <span className="toolbar-count">{visibleOrders.filter(o => o.status !== "CANCELLED").length}</span></div>
            <label className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or table..." /></label>
          </div>
          <section className="orders-board">
            {STAGES.map(stage => (
              <OrderColumn key={stage.key} stage={stage} orders={stageOrders(stage.key)}
                onAction={handleAction} onView={setViewOrder} onCancel={setCancelOrder} />
            ))}
          </section>
          <div className="bottom-grid">
            <OrderFlow orders={orders.filter(o => o.status !== "CANCELLED")} />
            <RecentActivity activities={activities} />
          </div>
          {cancelledCount > 0 && <div className="cancelled-note"><Trash2 size={15} /> {cancelledCount} order{cancelledCount > 1 ? "s" : ""} cancelled in this demo session.</div>}
          <footer className="dashboard-footer"><span>© Luxmor Cafe · Kitchen Operations</span><span>Frontend demo · API integration pending</span></footer>
        </div>
      </main>
      <CancelOrderModal order={cancelOrder} onClose={() => setCancelOrder(null)} onConfirm={confirmCancel} />
      <OrderDetailsModal order={viewOrder} onClose={() => setViewOrder(null)} />
    </div>
  );
}
