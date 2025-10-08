-- Vehicle Comparison System Database Schema
-- Creates tables and relationships for vehicle comparison functionality

-- Create comparison table to store saved comparisons
CREATE TABLE IF NOT EXISTS public.comparison (
  comparison_id SERIAL PRIMARY KEY,
  comparison_name VARCHAR(100) NOT NULL,
  comparison_description TEXT,
  account_id INTEGER NOT NULL,
  vehicle1_id INTEGER NOT NULL,
  vehicle2_id INTEGER,
  vehicle3_id INTEGER,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  CONSTRAINT fk_comparison_account 
    FOREIGN KEY (account_id) REFERENCES public.account (account_id) 
    ON UPDATE CASCADE ON DELETE CASCADE,
    
  CONSTRAINT fk_comparison_vehicle1 
    FOREIGN KEY (vehicle1_id) REFERENCES public.inventory (inv_id) 
    ON UPDATE CASCADE ON DELETE CASCADE,
    
  CONSTRAINT fk_comparison_vehicle2 
    FOREIGN KEY (vehicle2_id) REFERENCES public.inventory (inv_id) 
    ON UPDATE CASCADE ON DELETE CASCADE,
    
  CONSTRAINT fk_comparison_vehicle3 
    FOREIGN KEY (vehicle3_id) REFERENCES public.inventory (inv_id) 
    ON UPDATE CASCADE ON DELETE CASCADE,
    
  -- Ensure at least one vehicle is selected
  CONSTRAINT check_at_least_one_vehicle 
    CHECK (vehicle1_id IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comparison_account ON public.comparison (account_id);
CREATE INDEX IF NOT EXISTS idx_comparison_vehicles ON public.comparison (vehicle1_id, vehicle2_id, vehicle3_id);
CREATE INDEX IF NOT EXISTS idx_comparison_created ON public.comparison (created_date);

-- Create trigger to update the updated_date timestamp
CREATE OR REPLACE FUNCTION update_comparison_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_comparison_timestamp ON public.comparison;
CREATE TRIGGER trigger_update_comparison_timestamp
    BEFORE UPDATE ON public.comparison
    FOR EACH ROW
    EXECUTE FUNCTION update_comparison_timestamp();

-- Grant appropriate permissions
ALTER TABLE IF EXISTS public.comparison OWNER TO cse340;

-- Insert sample comparison data (optional - for testing)
-- Uncomment the following lines after creating some inventory items
/*
INSERT INTO public.comparison (comparison_name, comparison_description, account_id, vehicle1_id, vehicle2_id) 
VALUES 
  ('Sports Car Showdown', 'Comparing top performance vehicles', 1, 1, 2),
  ('Family SUV Comparison', 'Best family vehicles for safety and space', 1, 3, 4);
*/