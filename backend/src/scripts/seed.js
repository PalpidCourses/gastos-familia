require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://gastosfamilia:gastosfamilia_secure@localhost:5432/gastosfamilia',
});

async function seed() {
  console.log('🌱 Creando usuario de prueba...');

  try {
    // Crear tenant
    const tenantResult = await pool.query(`
      INSERT INTO tenants (name, slug)
      VALUES ('Familia Prueba', 'familia-prueba')
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `);

    let tenantId;
    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id;
    } else {
      const existing = await pool.query("SELECT id FROM tenants WHERE slug = 'familia-prueba'");
      tenantId = existing.rows[0].id;
    }

    console.log('✅ Tenant:', tenantId);

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Crear usuario admin
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, tenant_id, role, name)
      VALUES ('david@gastos-familia.com', $1, $2, 'admin', 'David')
      ON CONFLICT (tenant_id, email) DO UPDATE
      SET password_hash = $1
      RETURNING id, email, role
    `, [hashedPassword, tenantId]);

    const user = userResult.rows[0];
    console.log('✅ Usuario creado:', user.email);

    // Crear familia si no existe
    await pool.query(`
      INSERT INTO families (tenant_id, name, slug)
      VALUES ($1, 'Mi Familia', $2)
      ON CONFLICT DO NOTHING
    `, [tenantId, `fam-${tenantId}`]);

    console.log('✅ Familia creada');

    console.log('\n🎉 Usuario de prueba listo:');
    console.log('   Email: david@gastos-familia.com');
    console.log('   Password: password123');
    console.log('   Tenant: familia-prueba\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
