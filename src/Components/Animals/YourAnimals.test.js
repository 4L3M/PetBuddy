import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';
import YourAnimals from './YourAnimals';

// Mock dla useNavigate
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

// Mock dla supabase
const mockSupabase = {
    auth: {
        getUser: jest.fn(),
    },
    from: jest.fn(),
};

describe('YourAnimals Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading state', () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: null });
        render(
            <GlobalContext.Provider value={{ supabase: mockSupabase }}>
                <YourAnimals />
            </GlobalContext.Provider>,
        );
        expect(screen.getByText(/ładowanie zwierząt.../i)).toBeInTheDocument();
    });

    test('renders empty state when no animals', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
        });

        render(
            <GlobalContext.Provider value={{ supabase: mockSupabase }}>
                <YourAnimals />
            </GlobalContext.Provider>,
        );

        await waitFor(() => expect(screen.getByText(/nie masz jeszcze żadnych zwierząt/i)).toBeInTheDocument());
    });

    test('renders a list of animals and handles delete', async () => {
        const mockAnimals = [
            {
                animal_id: 1,
                name: 'Rex',
                text: 'Friendly dog',
                info: 'Age: 5',
                animal_photo: 'https://via.placeholder.com/150',
            },
        ];

        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockAnimals, error: null }),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null }),
        });

        render(
            <GlobalContext.Provider value={{ supabase: mockSupabase }}>
                <MemoryRouter>
                    <YourAnimals />
                </MemoryRouter>
            </GlobalContext.Provider>,
        );

        // Sprawdź, czy zwierzę jest renderowane
        await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument());
        expect(screen.getByText('Friendly dog')).toBeInTheDocument();

        // Obsługa usuwania
        const deleteButton = screen.getByText(/usuń/i);
        fireEvent.click(deleteButton);

        await waitFor(() =>
            expect(mockSupabase.from).toHaveBeenCalledWith('animals'),
        );
        expect(mockSupabase.from().delete).toHaveBeenCalled();
        expect(mockSupabase.from().eq).toHaveBeenCalledWith('animal_id', 1);
    });

    test('navigates to edit animal on edit button click', async () => {
        const mockAnimals = [
            {
                animal_id: 1,
                name: 'Rex',
                text: 'Friendly dog',
                info: 'Age: 5',
                animal_photo: 'https://via.placeholder.com/150',
            },
        ];

        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockAnimals, error: null }),
        });

        render(
            <GlobalContext.Provider value={{ supabase: mockSupabase }}>
                <MemoryRouter>
                    <YourAnimals />
                </MemoryRouter>
            </GlobalContext.Provider>,
        );

        // Kliknięcie przycisku "Edytuj"
        await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument());
        const editButton = screen.getByText(/edytuj/i);
        fireEvent.click(editButton);

        expect(mockNavigate).toHaveBeenCalledWith('/edit-animal/1');
    });
});
