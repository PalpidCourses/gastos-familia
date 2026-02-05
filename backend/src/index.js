const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL pool con RLS
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (para desarrollo)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware de RLS (tenant_id)
app.use(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      
      // Obtener tenant_id del token
      const userResult = await pool.query(`
        SELECT tenant_id FROM users WHERE id = $1
      `, [decoded.userId]);
      
      if (userResult.rows.length > 0) {
        req.tenantId = userResult.rows[0].tenant_id;
      }
    } catch (error) {
      // Token inválido, continuar sin auth
    }
  }
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Expenses routes (requiere autenticación)
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    // Solo gastos del tenant autenticado
    const result = await pool.query(`
      SELECT id, amount, description, category_id, merchant_id, payment_method, notes, created_at
      FROM expenses
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.tenantId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  console.log('POST /api/expenses, user:', req.user, 'tenantId:', req.tenantId);
  const { amount, description, category_id, merchant_id, payment_method, notes } = req.body;

  if (!req.tenantId) {
    return res.status(401).json({ error: 'No tenant found' });
  }

  try {
    // Convertir strings vacíos a NULL para UUIDs
    const categoryId = category_id || null;
    const merchantId = merchant_id || null;

    const result = await pool.query(`
      INSERT INTO expenses (tenant_id, amount, description, category_id, merchant_id, payment_method, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, amount, description, created_at
    `, [req.tenantId, amount, description, categoryId, merchantId, payment_method, notes]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'Error creating expense' });
  }
});

app.get('/api/expenses/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM expenses
      WHERE id = $1 AND tenant_id = $2
    `, [req.params.id, req.tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching expense:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  console.log('GET /api/categories, tenantId:', req.tenantId);
  try {
    const result = await pool.query(`
      SELECT id, name, color, icon, created_at
      FROM categories
      WHERE tenant_id = $1
      ORDER BY name ASC
    `, [req.tenantId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  console.log('POST /api/categories, tenantId:', req.tenantId, 'body:', req.body);
  const { name, color, icon } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO categories (tenant_id, name, color, icon)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, color, icon, created_at
    `, [req.tenantId, name, color || '#e17c60', icon]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Error creating category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { name, color, icon } = req.body;
  
  try {
    const result = await pool.query(`
      UPDATE categories
      SET name = COALESCE($2, name),
          color = COALESCE($3, color),
          icon = COALESCE($4, icon),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND tenant_id = $5
      RETURNING id, name, color, icon, updated_at
    `, [req.params.id, name, color, icon, req.tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Error updating category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM categories
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `, [req.params.id, req.tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Error deleting category' });
  }
});

// Family Members routes
app.get('/api/family-members', authenticateToken, async (req, res) => {
  try {
    // Obtener la primera familia del tenant (simplificado)
    const familyResult = await pool.query(`
      SELECT id, name, slug
      FROM families
      WHERE tenant_id = $1
      LIMIT 1
    `, [req.tenantId]);

    if (familyResult.rows.length === 0) {
      return res.json([]);
    }

    const familyId = familyResult.rows[0].id;

    const result = await pool.query(`
      SELECT fm.id, fm.role, fm.allocation_percentage,
             u.id as user_id, u.email, u.name, u.avatar_url, u.role as user_role
      FROM family_members fm
      JOIN users u ON fm.user_id = u.id
      WHERE fm.family_id = $1
      ORDER BY u.name ASC
    `, [familyId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching family members:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/family-members', authenticateToken, async (req, res) => {
  console.log('POST /api/family-members, tenantId:', req.tenantId, 'body:', req.body);
  const { user_id, role, allocation_percentage } = req.body;

  if (!user_id || !role) {
    return res.status(400).json({ error: 'user_id and role are required' });
  }

  try {
    // Obtener la primera familia del tenant
    const familyResult = await pool.query(`
      SELECT id FROM families
      WHERE tenant_id = $1
      LIMIT 1
    `, [req.tenantId]);

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: 'No family found' });
    }

    const familyId = familyResult.rows[0].id;

    // Validar que el usuario pertenece al tenant
    const userCheck = await pool.query(`
      SELECT id FROM users
      WHERE id = $1 AND tenant_id = $2
    `, [user_id, req.tenantId]);

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'User not found in this tenant' });
    }

    const result = await pool.query(`
      INSERT INTO family_members (family_id, user_id, role, allocation_percentage)
      VALUES ($1, $2, $3, $4)
      RETURNING id, role, allocation_percentage, user_id
    `, [familyId, user_id, role, allocation_percentage || 50]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating family member:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'User is already a family member' });
    }
    res.status(500).json({ error: 'Error creating family member' });
  }
});

app.put('/api/family-members/:id', authenticateToken, async (req, res) => {
  const { role, allocation_percentage } = req.body;

  try {
    const result = await pool.query(`
      UPDATE family_members
      SET role = COALESCE($2, role),
          allocation_percentage = COALESCE($3, allocation_percentage),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, role, allocation_percentage
    `, [req.params.id, role, allocation_percentage]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating family member:', err);
    res.status(500).json({ error: 'Error updating family member' });
  }
});

app.delete('/api/family-members/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      DELETE FROM family_members
      WHERE id = $1
      RETURNING id
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting family member:', err);
    res.status(500).json({ error: 'Error deleting family member' });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, tenantId } = req.body;
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear tenant
    const tenantResult = await pool.query(`
      INSERT INTO tenants (name, slug)
      VALUES ($1, $2)
      RETURNING id
    `, [tenantId || 'Mi Familia', tenantId || `tenant-${Date.now()}`]);
    
    const tenantIdDb = tenantResult.rows[0].id;
    
    // Crear usuario admin
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, tenant_id, role)
      VALUES ($1, $2, $3, 'admin')
      RETURNING id, email, role
    `, [email, hashedPassword, tenantIdDb]);
    
    // Crear familia por defecto
    await pool.query(`
      INSERT INTO families (tenant_id, name, slug)
      VALUES ($1, 'Mi Familia', $2)
    `, [tenantIdDb, `fam-${tenantIdDb}`]);
    
    const user = userResult.rows[0];
    const token = jwt.sign(
      { userId: user.id, tenantId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, tenantSlug } = req.body;
  
  try {
    // Buscar tenant por slug
    let tenantId = null;
    if (tenantSlug) {
      const tenantResult = await pool.query(`
        SELECT id FROM tenants WHERE slug = $1
      `, [tenantSlug]);
      if (tenantResult.rows.length > 0) {
        tenantId = tenantResult.rows[0].id;
      }
    }
    
    // Buscar usuario
    const userResult = await pool.query(`
      SELECT u.id, u.email, u.password_hash, u.role, u.tenant_id, t.slug as tenant_slug
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = $1 ${tenantId ? 'AND u.tenant_id = $2' : ''}
    `, [email, tenantId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
      tenant: { id: user.tenant_id, slug: user.tenant_slug },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend de Gastos Familia corriendo en puerto ${port}`);
});
