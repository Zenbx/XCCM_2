import { authenticatedFetch } from '@/lib/apiHelper';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').trim();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnnouncementAuthor {
  user_id: string;
  firstname: string;
  lastname: string;
  profile_picture?: string;
}

export interface AnnouncementComment {
  id: string;
  content: string;
  created_at: string;
  author: AnnouncementAuthor;
}

export interface Announcement {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: AnnouncementAuthor;
  comments: AnnouncementComment[];
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  type: 'TEXT' | 'FILE';
  created_at: string;
  _count: { submissions: number };
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  content: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  student?: AnnouncementAuthor;
}

export interface Notification {
  id: string;
  type: 'NEW_ASSIGNMENT' | 'COURSE_UPDATE' | 'NEW_ANNOUNCEMENT';
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// ─── Announcements ───────────────────────────────────────────────────────────

class ClassroomStreamService {
  async getAnnouncements(classId: string): Promise<Announcement[]> {
    const res = await authenticatedFetch(`${API_BASE}/api/classrooms/${classId}/announcements`);
    if (!res.ok) throw new Error('Erreur récupération annonces');
    const json = await res.json();
    return json.data.announcements;
  }

  async postAnnouncement(classId: string, content: string): Promise<Announcement> {
    const res = await authenticatedFetch(`${API_BASE}/api/classrooms/${classId}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Erreur publication annonce');
    const json = await res.json();
    return json.data.announcement;
  }

  async postComment(classId: string, announcementId: string, content: string): Promise<AnnouncementComment> {
    const res = await authenticatedFetch(
      `${API_BASE}/api/classrooms/${classId}/announcements/${announcementId}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }
    );
    if (!res.ok) throw new Error('Erreur ajout commentaire');
    const json = await res.json();
    return json.data.comment;
  }

  async deleteComment(classId: string, announcementId: string, commentId: string): Promise<void> {
    const res = await authenticatedFetch(
      `${API_BASE}/api/classrooms/${classId}/announcements/${announcementId}/comments?commentId=${commentId}`,
      { method: 'DELETE' }
    );
    if (!res.ok) throw new Error('Erreur suppression commentaire');
  }

  // ─── Assignments ────────────────────────────────────────────────────────────

  async getAssignments(classId: string): Promise<{ assignments: Assignment[]; isTeacher: boolean }> {
    const res = await authenticatedFetch(`${API_BASE}/api/classrooms/${classId}/assignments`);
    if (!res.ok) throw new Error('Erreur récupération devoirs');
    const json = await res.json();
    return json.data;
  }

  async createAssignment(
    classId: string,
    payload: { title: string; description?: string; due_date?: string; type: 'TEXT' | 'FILE' }
  ): Promise<Assignment> {
    const res = await authenticatedFetch(`${API_BASE}/api/classrooms/${classId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Erreur création devoir');
    const json = await res.json();
    return json.data.assignment;
  }

  async submitAssignment(classId: string, assignmentId: string, content: string): Promise<AssignmentSubmission> {
    const res = await authenticatedFetch(
      `${API_BASE}/api/classrooms/${classId}/assignments/${assignmentId}/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }
    );
    if (!res.ok) throw new Error('Erreur soumission devoir');
    const json = await res.json();
    return json.data.submission;
  }

  async gradeSubmission(
    classId: string,
    assignmentId: string,
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<AssignmentSubmission> {
    const res = await authenticatedFetch(
      `${API_BASE}/api/classrooms/${classId}/assignments/${assignmentId}/submit`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, score, feedback }),
      }
    );
    if (!res.ok) throw new Error('Erreur notation');
    const json = await res.json();
    return json.data.submission;
  }

  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await authenticatedFetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Erreur upload fichier');
    const json = await res.json();
    return { url: json.data.url };
  }

  // ─── Notifications ──────────────────────────────────────────────────────────

  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await authenticatedFetch(`${API_BASE}/api/notifications`);
    if (!res.ok) throw new Error('Erreur récupération notifications');
    const json = await res.json();
    return json.data;
  }

  async markAllRead(): Promise<void> {
    await authenticatedFetch(`${API_BASE}/api/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
  }

  async markRead(notificationId: string): Promise<void> {
    await authenticatedFetch(`${API_BASE}/api/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
  }
}

export const classroomStreamService = new ClassroomStreamService();
