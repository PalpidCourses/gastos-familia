import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
  });

  test('Login con credenciales válidas', async ({ page }) => {
    await page.fill('input[type="email"]', 'david@gastos-familia.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Esperar redirección al dashboard
    await expect(page).toHaveURL('http://localhost:3001/dashboard');

    // Verificar que el nombre de usuario aparece
    await expect(page.locator('text=david@gastos-familia.com')).toBeVisible();
  });

  test('Login falla con credenciales incorrectas', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    await expect(page.locator('text=Error al iniciar sesión')).toBeVisible();
  });

  test('Logout redirige al login', async ({ page }) => {
    // Login primero
    await page.fill('input[type="email"]', 'david@gastos-familia.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Logout
    await page.click('button:has-text("Cerrar sesión")');
    await expect(page).toHaveURL('**/login');
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'david@gastos-familia.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Muestra gastos del mes', async ({ page }) => {
    const amount = page.locator('text=€1.234');
    await expect(amount).toBeVisible();
  });

  test('Botón Nuevo Gasto navega al formulario', async ({ page }) => {
    await page.click('button:has-text("Nuevo Gasto")');
    await expect(page).toHaveURL('**/expenses/new');
  });
});

test.describe('Categorías CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login primero
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'david@gastos-familia.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navegar a categorías
    await page.click('text=Categorías');
    await page.waitForURL('**/categories');
  });

  test('Crear categoría', async ({ page }) => {
    await page.click('button:has-text("Nueva")');
    await expect(page.locator('h2:has-text("Nueva Categoría")')).toBeVisible();

    await page.fill('input[placeholder*="Comida"]', 'Comida Test');
    await page.fill('input[type="color"]', '#ff0000');
    await page.click('button:has-text("Crear")');

    // Esperar que aparezca en la lista
    await page.waitForSelector('text=Comida Test');
  });

  test('Editar categoría', async ({ page }) => {
    // Primero crear una categoría para editar
    await page.click('button:has-text("Nueva")');
    await page.fill('input[placeholder*="Comida"]', 'Categoría para Editar');
    await page.click('button:has-text("Crear")');
    await page.waitForSelector('text=Categoría para Editar');

    // Click en editar
    await page.click('button[aria-label="Editar"]:first');
    await page.fill('input[placeholder*="Comida"]', 'Categoría Editada');
    await page.click('button:has-text("Actualizar")');

    // Verificar que se actualizó
    await expect(page.locator('text=Categoría Editada')).toBeVisible();
  });

  test('Eliminar categoría con confirmación', async ({ page }) => {
    // Primero crear una categoría
    await page.click('button:has-text("Nueva")');
    await page.fill('input[placeholder*="Comida"]', 'A Borrar');
    await page.click('button:has-text("Crear")');
    await page.waitForSelector('text=A Borrar');

    page.on('dialog', dialog => dialog.accept());

    // Click en eliminar
    await page.click('button[aria-label="Eliminar"]:first');

    // Esperar que desaparezca
    await expect(page.locator('text=A Borrar')).not.toBeVisible();
  });
});

test.describe('Gastos CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login primero
    await page.goto('http://localhost:3001/login');
    await page.fill('input[type="email"]', 'david@gastos-familia.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Crear gasto básico', async ({ page }) => {
    await page.click('button:has-text("Nuevo Gasto")');
    await expect(page).toHaveURL('**/expenses/new');

    await page.fill('input[type="number"]', '15.50');
    await page.fill('input[placeholder*="Cena en restaurante"]', 'Cena de prueba');
    await page.selectOption('select', 'card');
    await page.fill('textarea', 'Notas de prueba');
    await page.click('button:has-text("Guardar")');

    // Verificar que guarda y redirige
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.locator('text=Cena de prueba')).toBeVisible();
  });

  test('Listar gastos desde API', async ({ page }) => {
    // Verificar que hay gastos en la lista
    await page.waitForSelector('text=Últimos gastos');
    const expenseItems = await page.locator('.card').all();
    await expect(expenseItems.length).toBeGreaterThan(0);
  });
});
