const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const router = express.Router();

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
router.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as val');
    return res.json({
      status: 'ok',
      service: 'Kru Aon Academic E-Portfolio API',
      database: 'connected',
      databaseType: 'TiDB Cloud Serverless',
      time: new Date()
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      service: 'Kru Aon Academic E-Portfolio API',
      database: 'disconnected',
      databaseType: 'Offline',
      error: err.message
    });
  }
});

// -------------------------------------------------------------
// Helper: Map Teacher DB row to CamelCase
// -------------------------------------------------------------
function mapTeacherRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || '',
    fullName: row.full_name || '',
    position: row.position || '',
    school: row.school || '',
    department: row.department || '',
    instructor: row.instructor || '',
    studentGroup: row.student_group || '',
    email: row.email || '',
    phone: row.phone || '',
    lineId: row.line_id || '',
    avatar: row.avatar || '',
    bio: row.bio || '',
    teachingPhilosophy: row.teaching_philosophy || '',
    statsJson: row.stats_json || '[]',
    educationJson: row.education_json || '[]',
    achievementsJson: row.achievements_json || '[]',
    updatedAt: row.updated_at
  };
}

// -------------------------------------------------------------
// Helper: Map Course DB row to CamelCase
// -------------------------------------------------------------
function mapCourseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code || '',
    name: row.name || '',
    level: row.level || '',
    semester: row.semester || '',
    credits: row.credits || '',
    description: row.description || '',
    badgeColor: row.badge_color || 'amber',
    icon: row.icon || 'smartphone',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// -------------------------------------------------------------
// Helper: Map Work DB row to CamelCase
// -------------------------------------------------------------
function mapWorkRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    courseId: row.course_id || '',
    title: row.title || '',
    category: row.category || 'student',
    categoryLabel: row.category_label || '',
    date: row.date || '',
    studentName: row.student_name || '',
    image: row.image || '',
    galleryImages: row.gallery_images || '[]',
    description: row.description || '',
    link: row.link || '#',
    downloadText: row.download_text || 'ดูรายละเอียด',
    tags: row.tags || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// -------------------------------------------------------------
// 1. Teacher Profile Routes
// -------------------------------------------------------------
router.get('/teacher', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers ORDER BY id ASC LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }
    return res.json(mapTeacherRow(rows[0]));
  } catch (err) {
    console.error('Error fetching teacher:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/teacher', async (req, res) => {
  try {
    const body = req.body;
    const [rows] = await pool.query('SELECT id FROM teachers ORDER BY id ASC LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Teacher profile not found' });
    }
    const teacherId = rows[0].id;

    // Stringify json fields if provided as objects
    const statsJson = typeof body.stats === 'object' ? JSON.stringify(body.stats) : (body.statsJson || '[]');
    const educationJson = typeof body.education === 'object' ? JSON.stringify(body.education) : (body.educationJson || '[]');
    const achievementsJson = typeof body.academicAchievements === 'object' ? JSON.stringify(body.academicAchievements) : (body.achievementsJson || '[]');

    const updateSql = `
      UPDATE teachers SET
        name = ?,
        full_name = ?,
        position = ?,
        school = ?,
        department = ?,
        instructor = ?,
        student_group = ?,
        email = ?,
        phone = ?,
        line_id = ?,
        avatar = ?,
        bio = ?,
        teaching_philosophy = ?,
        stats_json = ?,
        education_json = ?,
        achievements_json = ?,
        updated_at = NOW(3)
      WHERE id = ?
    `;

    await pool.query(updateSql, [
      body.name || '',
      body.fullName || '',
      body.position || '',
      body.school || '',
      body.department || '',
      body.instructor || '',
      body.studentGroup || '',
      body.email || '',
      body.phone || '',
      body.lineId || '',
      body.avatar || '',
      body.bio || '',
      body.teachingPhilosophy || '',
      statsJson,
      educationJson,
      achievementsJson,
      teacherId
    ]);

    const [updatedRows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [teacherId]);
    return res.json(mapTeacherRow(updatedRows[0]));
  } catch (err) {
    console.error('Error updating teacher:', err);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. Courses Routes
// -------------------------------------------------------------
router.get('/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at ASC');
    return res.json(rows.map(mapCourseRow));
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const body = req.body;
    const id = body.id || `course-${Date.now()}`;
    const insertSql = `
      INSERT INTO courses (id, code, name, level, semester, credits, description, badge_color, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
    `;
    await pool.query(insertSql, [
      id,
      body.code || '',
      body.name || '',
      body.level || '',
      body.semester || '',
      body.credits || '',
      body.description || '',
      body.badgeColor || 'amber',
      body.icon || 'smartphone'
    ]);

    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return res.status(201).json(mapCourseRow(rows[0]));
  } catch (err) {
    console.error('Error creating course:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const updateSql = `
      UPDATE courses SET
        code = ?,
        name = ?,
        level = ?,
        semester = ?,
        credits = ?,
        description = ?,
        badge_color = ?,
        icon = ?,
        updated_at = NOW(3)
      WHERE id = ?
    `;
    await pool.query(updateSql, [
      body.code || '',
      body.name || '',
      body.level || '',
      body.semester || '',
      body.credits || '',
      body.description || '',
      body.badgeColor || 'amber',
      body.icon || 'smartphone',
      id
    ]);

    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    return res.json(mapCourseRow(rows[0]));
  } catch (err) {
    console.error('Error updating course:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM works WHERE course_id = ?', [id]);
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    return res.json({ message: 'Course and associated works deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. Works Routes
// -------------------------------------------------------------
router.get('/works', async (req, res) => {
  try {
    const { courseId, category } = req.query;
    let sql = 'SELECT * FROM works WHERE 1=1';
    const params = [];

    if (courseId && courseId !== 'all') {
      sql += ' AND course_id = ?';
      params.push(courseId);
    }
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    return res.json(rows.map(mapWorkRow));
  } catch (err) {
    console.error('Error fetching works:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/works', async (req, res) => {
  try {
    const body = req.body;
    const id = body.id || `work-${Date.now()}`;
    const galleryImages = typeof body.galleryImages === 'string' ? body.galleryImages : JSON.stringify(body.galleryImages || body.galleryList || []);

    const insertSql = `
      INSERT INTO works (id, course_id, title, category, category_label, date, student_name, image, gallery_images, description, link, download_text, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
    `;
    await pool.query(insertSql, [
      id,
      body.courseId || '',
      body.title || '',
      body.category || 'student',
      body.categoryLabel || 'ผลงานนักเรียน',
      body.date || '',
      body.studentName || '',
      body.image || '',
      galleryImages,
      body.description || '',
      body.link || '#',
      body.downloadText || 'ดูรายละเอียด',
      body.tags || ''
    ]);

    const [rows] = await pool.query('SELECT * FROM works WHERE id = ?', [id]);
    return res.status(201).json(mapWorkRow(rows[0]));
  } catch (err) {
    console.error('Error creating work:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.put('/works/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const galleryImages = typeof body.galleryImages === 'string' ? body.galleryImages : JSON.stringify(body.galleryImages || body.galleryList || []);

    const updateSql = `
      UPDATE works SET
        course_id = ?,
        title = ?,
        category = ?,
        category_label = ?,
        date = ?,
        student_name = ?,
        image = ?,
        gallery_images = ?,
        description = ?,
        link = ?,
        download_text = ?,
        tags = ?,
        updated_at = NOW(3)
      WHERE id = ?
    `;

    await pool.query(updateSql, [
      body.courseId || '',
      body.title || '',
      body.category || 'student',
      body.categoryLabel || 'ผลงานนักเรียน',
      body.date || '',
      body.studentName || '',
      body.image || '',
      galleryImages,
      body.description || '',
      body.link || '#',
      body.downloadText || 'ดูรายละเอียด',
      body.tags || '',
      id
    ]);

    const [rows] = await pool.query('SELECT * FROM works WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Work not found' });
    return res.json(mapWorkRow(rows[0]));
  } catch (err) {
    console.error('Error updating work:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/works/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM works WHERE id = ?', [id]);
    return res.json({ message: 'Work deleted successfully' });
  } catch (err) {
    console.error('Error deleting work:', err);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. Downloads Routes
// -------------------------------------------------------------
router.get('/downloads', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM downloads ORDER BY created_at ASC');
    return res.json(rows);
  } catch (err) {
    return res.json([]);
  }
});

router.post('/downloads', async (req, res) => {
  return res.status(201).json(req.body);
});

router.put('/downloads/:id', async (req, res) => {
  return res.json(req.body);
});

router.delete('/downloads/:id', async (req, res) => {
  return res.json({ message: 'Download item deleted' });
});

// Mount router on both /api and / to handle any rewrite scenario
app.use('/api', router);
app.use('/', router);

// Start server when executed directly (e.g. node api/index.js)
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
