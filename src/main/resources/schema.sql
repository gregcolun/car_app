DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'car_ads'
          AND column_name = 'imagine_url'
    ) THEN
        ALTER TABLE car_ads
            ALTER COLUMN imagine_url TYPE TEXT;
    END IF;
END $$;

UPDATE car_ads
SET imagine_url = NULL
WHERE imagine_url ~ '^[0-9]+$';

ALTER TABLE car_ads
ADD COLUMN IF NOT EXISTS nr_telefon VARCHAR(30);
