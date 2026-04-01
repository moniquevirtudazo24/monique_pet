export type UserRole = 'customer' | 'admin'

export interface Profile {
    id: string
    full_name: string
    email: string
    phone: string
    role: UserRole
    created_at: string
}

export interface Pet {
    id: string
    owner_id: string
    name: string
    type: string
    breed: string
    notes: string
    created_at: string
}

export type AppointmentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'archived'

export interface Appointment {
    id: string
    pet_id: string
    owner_id: string
    service: string
    scheduled_at: string
    status: AppointmentStatus
    admin_notes: string
    created_at: string
    // joined
    pets?: Pet
    profiles?: Profile
}

export const SERVICES = [
    'Full Grooming',
    'Bath & Dry',
    'Haircut Only',
    'Nail Trimming',
    'Teeth Cleaning',
    'Ear Cleaning',
    'De-shedding Treatment',
]

export const PET_TYPES = [
    'Dog',
    'Cat',
    'Rabbit',
    'Guinea Pig',
    'Bird',
    'Other',
]
