import { GlobalContext } from "./GlobalContext";


async function insertData() {
  // Wstawianie użytkowników
  const { data: users, error: usersError } = await supabase.auth.admin.createUser({
    email: 'user1@example.com',
    password: 'password1',
  });

  const { data: secondUser, error: secondUserError } = await supabase.auth.admin.createUser({
    email: 'user2@example.com',
    password: 'password2',
  });

  if (usersError || secondUserError) {
    console.error('Błąd podczas dodawania użytkowników:', usersError || secondUserError);
    return;
  }

  // Pobranie ID użytkowników
  const userId1 = users.user.id;
  const userId2 = secondUser.user.id;

  console.log('Dodano użytkowników:', userId1, userId2);

  // Wstawianie szczegółów użytkowników
  const { error: detailsError } = await supabase.from('user_details').insert([
    { user_id: userId1, name: 'Jan', surname: 'Kowalski', location: 'Warszawa', account_type: 'regular' },
    { user_id: userId2, name: 'Anna', surname: 'Nowak', location: 'Kraków', account_type: 'premium' },
  ]);

  if (detailsError) {
    console.error('Błąd podczas dodawania szczegółów użytkownika:', detailsError);
  } else {
    console.log('Pomyślnie dodano szczegóły użytkowników.');
  }
}

insertData();
