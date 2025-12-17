-- SQL skripta za kreiranje test korisnika
-- Pokreni u SQL Server Management Studio
-- Baza: nova_app

USE nova_app;
GO

-- Prvo, proveri da li korisnik već postoji
IF EXISTS (SELECT 1 FROM [User] WHERE email = 'test@example.com')
BEGIN
    PRINT 'Korisnik već postoji!';
    SELECT * FROM [User] WHERE email = 'test@example.com';
END
ELSE
BEGIN
    -- Hash password: 'test123' (bcrypt sa salt 10)
    -- Generisan sa: bcrypt.hash('test123', 10)
    -- Ovo je pravi bcrypt hash za 'test123'
    DECLARE @passwordHash NVARCHAR(255) = '$2a$10$qlQPhyxuZy3aXXyvqXGK9u1TPCZPMbAPHtwNo.xuK/KB1kW5Xeu3.';
    
    -- Kreiraj korisnika
    DECLARE @userId NVARCHAR(255) = NEWID();
    
    INSERT INTO [User] (id, email, name, passwordHash, [plan], createdAt, updatedAt)
    VALUES (
        @userId,
        'test@example.com',
        'Test User',
        @passwordHash,
        'FREE',
        GETDATE(),
        GETDATE()
    );
    
    -- Kreiraj preferences
    INSERT INTO [UserPreferences] (id, userId, topics, sources, language, darkMode, autoDarkMode, createdAt, updatedAt)
    VALUES (
        NEWID(),
        @userId,
        '[]',
        '[]',
        'en',
        0,
        1,
        GETDATE(),
        GETDATE()
    );
    
    PRINT '✅ Test korisnik kreiran uspešno!';
    PRINT '';
    PRINT '📧 Login podaci:';
    PRINT '   Email: test@example.com';
    PRINT '   Password: test123';
    PRINT '';
    PRINT 'Možeš se sada ulogovati na http://localhost:3000/login';
END
GO
