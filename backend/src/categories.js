// Categories routes (requiere autenticación)
app.get('/api/categories', async (req, res) => {
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
