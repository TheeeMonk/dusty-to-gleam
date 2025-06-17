
-- Legg til flere detaljer for eiendommer
ALTER TABLE public.properties 
ADD COLUMN floors integer,
ADD COLUMN bathrooms integer,
ADD COLUMN bedrooms integer,
ADD COLUMN balcony boolean DEFAULT false,
ADD COLUMN garden boolean DEFAULT false,
ADD COLUMN parking boolean DEFAULT false,
ADD COLUMN elevator boolean DEFAULT false;

-- Legg til kommentar for å beskrive kolonner
COMMENT ON COLUMN public.properties.floors IS 'Antall etasjer i boligen';
COMMENT ON COLUMN public.properties.bathrooms IS 'Antall bad/toaletter';
COMMENT ON COLUMN public.properties.bedrooms IS 'Antall soverom';
COMMENT ON COLUMN public.properties.balcony IS 'Om boligen har balkong';
COMMENT ON COLUMN public.properties.garden IS 'Om boligen har hage';
COMMENT ON COLUMN public.properties.parking IS 'Om boligen har parkering';
COMMENT ON COLUMN public.properties.elevator IS 'Om bygget har heis';
