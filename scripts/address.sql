//filepath: scripts/address.sql
USE [EFP_PSO]
GO
SET IDENTITY_INSERT [dbo].[regions] ON 
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (51, N'ሐረሪ', N'Harari')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (77, N'ቤኒሻንጉል ጉሙዝ', N'Benishangul-Gumuz')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (14, N'አዲስ አበባ', N'Addis Ababa')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (71, N'ሲዳማ', N'Sidama')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (50, N'ሶማሌ', N'Somali')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (10, N'ትግራይ', N'Tigray')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (30, N'አማራ', N'Amhara')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (40, N'ኦሮሚያ', N'Oromia')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (22, N'ደቡብ ብሔሮች ብሔረሰቦችና ሕዝቦች', N'SNNP')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (80, N'ጋምቤላ', N'Gambella')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (73, N'ደቡብ ኢትዮጵያ', N'South Ethiopia')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (11, N'ድሬዳዋ', N'Dire Dawa')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (25, N'አፋር', N'Afar')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (70, N'ደቡብ ምዕራብ ኢትዮጵያ ሕዝቦች', N'South West Ethiopia')
GO
INSERT [dbo].[regions] ([region_id], [region_name_am], [region_name_en]) VALUES (72, N'ማዕከላዊ ኢትዮጵያ', N'Central Ethiopia')
GO
SET IDENTITY_INSERT [dbo].[regions] OFF
GO

USE [EFP_PSO]
GO
SET IDENTITY_INSERT [dbo].[zones] ON 
GO

-- Region 80: Gambella
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8007, 80, N'ኒውር', N'Newer')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8006, 80, N'መጄንገር', N'Mejenger')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8005, 80, N'መሓከላዊ', N'Mehakelawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8004, 80, N'ኢታንግ ልዩ', N'Itang Special')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8003, 80, N'ጌዴዎ', N'Gedeo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8002, 80, N'ቤንች ሸኮ', N'Bench Sheko')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (8001, 80, N'አንገዋክ', N'Angewak')
GO

-- Region 77: Benishangul-Gumuz
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7711, 77, N'መተከል', N'Metekel')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7710, 77, N'ምርአብ ኦሞ', N'Merab Omo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7709, 77, N'መሓከላዊ', N'Mehakelawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7708, 77, N'ማኦ እና ኮሞ', N'Mao Ena Komo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7707, 77, N'ከማሺ', N'Kemashi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7706, 77, N'ጅማ', N'ጂማ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7705, 77, N'ጉራጌ', N'Gurage')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7704, 77, N'ጉራጌ', N'Gurage')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7703, 77, N'ኤረር', N'Erer')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7702, 77, N'ቡኖ በደሌ', N'Buno Bedele')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7701, 77, N'አሶሳ', N'Assosa')
GO

-- Region 73: South Ethiopia
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7312, 73, N'ሁሉም ዞን', N'Alle Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7311, 73, N'ባስኬቶ ዞን', N'Basketo Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7310, 73, N'ቡርጂ ዞን', N'Burji Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7309, 73, N'ኮንሶ ዞን', N'Konso Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7308, 73, N'ደቡብ ኦሞ ዞን', N'South Omo Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7307, 73, N'ኮሬ ዞን', N'Koore Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7306, 73, N'ጋርዱላ ዞን', N'Gardula Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7305, 73, N'አሪ ዞን', N'Ari Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7304, 73, N'ጌዴዎ ዞን', N'Gedeo Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7303, 73, N'ጎፋ ዞን', N'Gofa Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7302, 73, N'ጋሞ ዞን', N'Gamo Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7301, 73, N'ወላይታ ዞን', N'Wolayita Zone')
GO

-- Region 72: Central Ethiopia
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7210, 72, N'ማረኮ', N'Mareko')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7209, 72, N'ጠምባሮ', N'Tembaro')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7208, 72, N'ኬቤና', N'Kebena')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7207, 72, N'የም', N'Yem')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7206, 72, N'ስልጤ', N'Silte')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7205, 72, N'ከምባታ', N'Kembata')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7204, 72, N'ሀላባ', N'Halaba')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7203, 72, N'ሀዲያ', N'Hadiya')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7202, 72, N'ጉራጌ', N'Gurage')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7201, 72, N'ምስራቅ ጉራጌ', N'East Gurage')
GO

-- Region 71: Sidama
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7110, 71, N'ሲዳማ ሰሜን ዞን', N'Sidama Semen Zone ne')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7109, 71, N'ሲዳማ ምስራቅ ወንዲታ', N'Sidama Misrak Withdatt')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7108, 71, N'ሲዳማ መሃል ዞን', N'Sidama Mehal Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7107, 71, N'ሲዳማ ደቡብዊ', N'Sidama Debubawi with C')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7106, 71, N'ሸካ', N'Sheka')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7105, 71, N'ሀዋሳ ከተማ አስተዳደር', N'Hawassa City Adminstra')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7104, 71, N'ሀዲያ', N'Hadiya')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7103, 71, N'ጉራጌ', N'Gurage_')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7102, 71, N'ጌዴዎ', N'Gedeo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7101, 71, N'ዳውሮ', N'Dawro_')
GO

-- Region 70: South West Ethiopia
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7007, 70, N'ሸካ', N'Sheka')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7006, 70, N'ምርአብ ኦሞ', N'Merab Omo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7005, 70, N'ኮንታ ልዩ', N'Konta Liyu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7004, 70, N'ኬፋ', N'Kefa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7003, 70, N'ደቡባዊ', N'Debubawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7002, 70, N'ዳውሮ', N'Dawro')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (7001, 70, N'ቤንች ሸኮ', N'Bench Sheko')
GO

-- Region 51: Harari
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5104, 51, N'ቀበሌ 02', N'Kebele 02')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5103, 51, N'ሶፊ', N'Sofi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5102, 51, N'ኤረር', N'Errer')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5101, 51, N'ደረ ተያራ', N'Dire Teyara')
GO

-- Region 50: Somali
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5019, 50, N'ስልጤ', N'Silite')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5018, 50, N'ሸበሌ', N'Shebele')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5017, 50, N'ኖጎብ', N'Nogob')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5015, 50, N'ምርአብ ሐራርጌ', N'Mirab Hararghe')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5014, 50, N'ሊበን', N'Liben')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5013, 50, N'ኮራሄ', N'Koraha')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5012, 50, N'ኬፋ', N'Kefa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5011, 50, N'ጀረር', N'Jerer')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5010, 50, N'ፋፈን', N'Fafan')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5009, 50, N'ኤረር', N'Erer')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5008, 50, N'ዶሎ', N'Dollo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5006, 50, N'ዳውሮ', N'Dawro')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5005, 50, N'ዳዋ', N'Dawa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5004, 50, N'ቦረና', N'Borena')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (5001, 50, N'አፍዴር', N'Afder')
GO

-- Region 40: Oromia
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4072, 40, N'ሸገር ዙሪያ', N'Sheger Zuriya')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4071, 40, N'ነቀምተ ልዩ ዞን', N'Nekemte Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4070, 40, N'ባቱ ልዩ ዞን', N'Batu Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4064, 40, N'ወሊሶ ልዩ ዞን', N'Woliso Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4063, 40, N'ሱሉልታ', N'Sululta')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4062, 40, N'ሻሻማነ ልዩ ዞን', N'Shashamane Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4061, 40, N'ሰሜን ሸዋ', N'Semen Shewa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4060, 40, N'ሳባታ', N'Sabata')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4059, 40, N'ሮቤ ልዩ ዞን', N'Robe Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4058, 40, N'ኦሮሚያ ልዩ ዞን', N'Oromiya Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4057, 40, N'ሞድጆ ልዩ ዞን', N'Modjo Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4056, 40, N'ምስራቅ ወሎጋ', N'Misrak Wollega')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4055, 40, N'ምስራቅ ሸዋ', N'Misrak Shewa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4054, 40, N'ምስራቅ ሐረርጌ', N'Misrak Hararge')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4053, 40, N'ምስራቅ ጉጂ', N'Mirab Guji')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4052, 40, N'ምስራቅ አርሲ', N'Mirab Arsi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4051, 40, N'ምርሀብ ባሌ', N'Merab Bale')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4050, 40, N'ከሌም ወሎጋ', N'Kelem Wollega')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4049, 40, N'ጅማ ልዩ', N'Jimma Liyu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4045, 40, N'ጅማ', N'ጂማ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4042, 40, N'ሆሮ ጉዱሩ ወሎጋ', N'Horo Guduru Wollega')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4039, 40, N'ሆሌታ ልዩ ዞን', N'Holeta Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4037, 40, N'ጉጂ', N'Guji')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4036, 40, N'ገላን ልዩ ዞን', N'Gelan Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4031, 40, N'ዱካም ልዩ ዞን', N'Dukam Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4030, 40, N'ደቡብ ምርባ ሸዋ', N'Debub Mirab Shewa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4027, 40, N'ቡራዩ', N'Burayu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4021, 40, N'ቡኖ በደሌ', N'Buno Bedele')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4018, 40, N'ቦሬና', N'Borena')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4017, 40, N'ቢሾፍቱ ልዩ ዞን', N'Bishoftu Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4016, 40, N'ቢሻን ጉራቻ ልዩ ዞን', N'Bishan Guracha Liyu Zo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4015, 40, N'አሰላ ልዩ ዞን', N'Asela Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4014, 40, N'አርሲ', N'Arsi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4012, 40, N'አምቦ ከተማ አስተዳደር', N'Ambo City Admin')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4011, 40, N'አዳማ ልዩ ዞን', N'Adama Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4010, 40, N'ሌጋ ታፎ ሌጋ ዳዲ', N'ሌጋ ታፎ ሌጋ ዳዲ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4008, 40, N'ኢሉ አባቦር', N'Ilu Ababor')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4005, 40, N'ደቡብ ምርባ ሸዋ', N'Debub Mirab Shewa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4001, 40, N'ደቡብ ምስራቅ ሸዋ', N'Debub Mirab Shewa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4003, 40, N'ቡሬ', N'ቡሬ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4040, 40, N'ጅማ', N'ጂማ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4047, 40, N'ሻሸማኔ', N'Shashamane')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (4048, 40, N'ቡሌ ሆራ', N'ቡሌ ሆራ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3051, 30, N'ዋጂምራ', N'Waghimra')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3050, 30, N'ሰሜን ወሎ', N'Semen Wello')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3049, 30, N'ሰሜን ሸዋ', N'Semen Shewa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3047, 30, N'ሰሜን ጎንደር', N'Semen Gonder')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3045, 30, N'ኦሮሚያ ልዩ ዞን', N'Oromiya Liyu Zone')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3043, 30, N'ምስራቅ ጎጃም', N'Misrak Gojjam')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3038, 30, N'ምርአብ ጎንደር', N'Mirab Gonder')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3037, 30, N'ምርአብ ጎጃም', N'Mirab Gojjam')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3034, 30, N'ማእከላዊ ጎንደር', N'Maekelawi Gonder')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3022, 30, N'ጎንደር ከተማ ልዩ ዞን', N'Gondar Ketema Liyu Zo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3015, 30, N'ዳሴ ከተማ አስተዳደር', N'Dessie Town Administra')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3013, 30, N'ደቡብ ወሎ', N'Debub Wello')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3011, 30, N'ደቡብ ምስራቅ', N'Debub Misrak')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3009, 30, N'ደቡብ ጎንደር', N'Debub Gonder')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3003, 30, N'ባህር ዳር ልዩ', N'Bahir Dar Liyu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3002, 30, N'አዊ', N'Awi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3001, 30, N'አርጎባ', N'Argoba')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3016, 30, N'ጌላሄሙር', N'ጌላሄሙር')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3017, 30, N'ጎደ', N'Gode')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3023, 30, N'አንጎለላናተራ', N'አንጎለላነታራ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3024, 30, N'ደሓና', N'ደሃና')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3026, 30, N'አሪቱማ ፉርሲ', N'አሪቱማ ፉርሲ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3027, 30, N'ኤነማይ', N'ኤነማይ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (3029, 30, N'ገራ', N'Gera')
GO

-- Region 25: Afar
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2521, 25, N'አርጎባ ልዩ', N'አርጎባ ሊዩ')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2520, 25, N'ሰሜራ', N'Semera')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2519, 25, N'ዞን 6', N'Zone_6')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2518, 25, N'ዞን 5 (ሀሪ ረሱ)', N'Zone_5 (Hari Resu)')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2517, 25, N'ዞን 4 (ፈንትረሱ)', N'Zone_4 (Fentiresu)')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2516, 25, N'ዞን 3 (ገቢረሱ)', N'Zone_3 (Gebiresu)')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2515, 25, N'ዞን 2 (ከልበትረሱ)', N'Zone_2 (Kelbetiresu)')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2514, 25, N'ዞን 1 (አውሲረሱ)', N'Zone_1(Awsiresu)')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2513, 25, N'ሰሜን ጎንደር', N'Semen Gonder')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2512, 25, N'ምስራቅ ጎጃም', N'Misrak Gojjam')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2511, 25, N'ምርአብ ሐራርጌ', N'Mirab Hararghe')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2510, 25, N'ኬፋ', N'Kefa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2509, 25, N'ኢሉ አባቦር', N'Ilu Ababor')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2508, 25, N'ሐዲያ', N'Hadiya')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2507, 25, N'ጉራጌ', N'Gurage')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2506, 25, N'ጉጂ', N'Guji')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2505, 25, N'ፋፈን', N'Fafan')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2504, 25, N'ዶሎ', N'Dollo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2503, 25, N'ደቡብ ወሎ', N'Debub Wello')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2502, 25, N'ደቡብ ኦሞ', N'Debub Omo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2501, 25, N'አፋር', N'Afar')
GO

-- Region 22: SNNP
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2221, 22, N'የም ልዩ', N'Yem Liyu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2219, 22, N'ወላይታ', N'Welayta')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2218, 22, N'ሲሊተ', N'Silite')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2217, 22, N'ኮንሶ', N'Konso')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2216, 22, N'ኬምባታ ተምባሮ', N'Kembata Tembaro')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2215, 22, N'ሀላባ', N'Halaba')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2214, 22, N'ሀዲያ', N'Hadiya')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2213, 22, N'ጉራጌ', N'Gurage')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2212, 22, N'ጎፋ', N'Gofa')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2211, 22, N'ጌዴዎ', N'Gedeo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2210, 22, N'ጋሞ', N'Gamo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2209, 22, N'ዲላ ከተማ አስተዳደር', N'Dilla City Admin')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2201, 22, N'አሌ', N'Ale')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2220, 22, N'ወላይታ', N'Wolaita')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2208, 22, N'ደራሸ ልዩ', N'Derashe Liyu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2207, 22, N'ደቡባዊ', N'Debubawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2206, 22, N'ደቡብ ኦሞ', N'Debub Omo')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2205, 22, N'ዳውሮ', N'Dawro')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2204, 22, N'ቡርጂ ልዩ', N'Burji Liyu')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2203, 22, N'ባስኬቶ ልዩ', N'Basketo Special')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (2202, 22, N'አማሮ ልዩ', N'Amaro Liyu')
GO

-- Region 14: Addis Ababa
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1412, 14, N'ለሚ ኩራ', N'Lemi Kura')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1411, 14, N'ቦሌ ንግድ ክፍል', N'Bole SubCity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1410, 14, N'ቂርቆስ ንግድ ክፍል', N'Kirkos Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1409, 14, N'የካ ንግድ ክፍል', N'Yeka Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1407, 14, N'ንፋስ ስልክ ላፍቶ ንግድ ክፍል', N'Nifas Slik Lafto Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1406, 14, N'ልደታ ንግድ ክፍል', N'Lideta Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1405, 14, N'ኮልፌ ቀራኒዮ ንግድ ክፍል', N'Kolfe Keraniyo Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1404, 14, N'ጉሌሌ ንግድ ክፍል', N'Gulele Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1403, 14, N'አራዳ ንግድ ክፍል', N'Arada Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1402, 14, N'አቃቂ ቃሊቲ ንግድ ክፍል', N'Akaki Kaliti Subcity')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1401, 14, N'አዲስ ከተማ ንግድ ክፍል', N'Addis Ketema Subcity')
GO

-- Region 11: Dire Dawa
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1102, 11, N'ድሬዳዋ', N'Dire Dawa')
GO

-- Region 10: Tigray
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1008, 10, N'ደቡብ ምስራቅ', N'Debub Misrak')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1007, 10, N'ሰሜን ምርባ', N'Semen Mirab')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1006, 10, N'ምስራቅአዊ', N'Misrakawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1005, 10, N'ምርአብአዊ', N'Mirabawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1004, 10, N'መቀሌ', N'Mekele')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1003, 10, N'መሓከላዊ', N'Mehakelawi')
GO
INSERT [dbo].[zones] ([zone_id], [region_id], [zone_name_am], [zone_name_en]) VALUES (1002, 10, N'ደቡባዊ', N'Debubawi')
GO

USE [EFP_PSO]
GO
SET IDENTITY_INSERT [dbo].[woredas] ON 
GO

-- --------------------------------------------------
-- weroda section
-- --------------------------------------------------
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405490, 4054, N'አሌታ ቹኮ', N'አሌታ ቹኮ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405493, 4054, N'ቺናክሰን', N'Chinaksen')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405496, 4054, N'ደደር ከተማ አሰተዳደር', N'ደደር ከተማ አሰተዳደር')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405411, 4054, N'ጎሎ ኦዳ', N'ጎሎ ኦዳ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405413, 4054, N'ጎሮጉቱ', N'Gorogutu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405415, 4054, N'ሀሬማያ', N'Haremaya')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405417, 4054, N'ጃርሶ', N'Jarso')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405419, 4054, N'ኮምቦሎቻ', N'Kombolocha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405422, 4054, N'መልካ ቤሎ', N'መልካ ቤሎ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405424, 4054, N'ሜዩ ሙሉኬ', N'ሜዩ ሙሉኬ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405457, 4055, N'አዳሚቱ', N'Adamitu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405549, 4055, N'አኬኪ', N'Akeki')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405511, 4055, N'ቦሴት', N'Boset')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405513, 4055, N'ፈንታሌ', N'Fentale')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405515, 4055, N'ሊቤን ቹካላ', N'ሊቤን ቹካላ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405618, 4056, N'ቦናያቦሸ', N'Bonayaboshe')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405620, 4056, N'ኤባንቱ', N'Ebantu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405622, 4056, N'ጎቡ ሴዮ', N'ጎቡ ሴዮ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405623, 4056, N'ሀሮ ሊሙ', N'ሀሮ ሊሙ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405627, 4056, N'ኪራሙ', N'Kiramu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405629, 4056, N'ሊሙ', N'Limu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405631, 4056, N'ሳሲጋ', N'Sasiga')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405633, 4056, N'ዋማ ሀገሎ', N'ዋማ ሀገሎ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (407106, 4071, N'ነከምቴ', N'Nekemte')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405808, 4058, N'ሙሎ', N'Mulo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405810, 4058, N'ሴንዳፋ ባኬ', N'ሴንዳፋ ባኬ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405812, 4058, N'ዋልማራ', N'Walmara')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (40601, 4060, N'ሳባታ', N'Sabata')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406116, 4061, N'አለልቱ', N'Aleltu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406118, 4061, N'ደብሬ ሊባኖስ', N'ደብሬ ሊባኖስ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406120, 4061, N'ጊራር ጃርሶ', N'ጊራር ጃርሶ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406123, 4061, N'ኪምቢቢት', N'Kimbibit')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406125, 4061, N'ዋራ ጃርሶ', N'ዋራ ጃርሶ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406127, 4061, N'ያያ ጉሌሌ', N'ያያ ጉሌሌ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406430, 4064, N'ወሊሶ', N'Woliso')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220720, 2207, N'ሃዋጋላን', N'Hawagalan')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405340, 4053, N'አለልቱ', N'Aleltu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400101, 4001, N'አሜያ', N'Ameya')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400103, 4001, N'ከርሳ ማሊማ', N'ከርሳ ማሊማ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400301, 4003, N'አሌልቱ', N'Aleltu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400303, 4003, N'ዳርሙ', N'Darimu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400302, 4003, N'ያዮ', N'Yayo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400501, 4005, N'ሌጋ ታፎ ሌጋ ዳዲ', N'ሌጋ ታፎ ሌጋ ዳዲ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400810, 4008, N'አባ ገዳ', N'አባ ገዳ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400812, 4008, N'ቦኩ', N'Boku')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400813, 4008, N'ደኒቤል', N'Denibel')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401102, 4011, N'አሌታ ቹኮ', N'አሌታ ቹኮ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401104, 4011, N'አሰኮ', N'Aseko')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401106, 4011, N'ቤኮጂ ከተማ አስተዳደር', N'ቤኮጂ ከተማ አስተዳደር')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401109, 4011, N'ቾሌ', N'Chole')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401111, 4011, N'ዲጋሉ ና ቲጆ', N'ዲጋሉ ና ቲጆ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401114, 4011, N'ጎሎቻ', N'Golocha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401116, 4011, N'ጉና', N'Guna')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401118, 4011, N'ሆንኮሎ ዋቤ', N'Honloko Wabe')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401121, 4011, N'ሌሙ ና ቢልቢሎ', N'Lemu Na Bilbilo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401123, 4011, N'መርቲ', N'Merti')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401125, 4011, N'ሮቤ', N'Robe')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401127, 4011, N'ሻነን ኮሉ', N'Shanen Kolu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401130, 4011, N'ሱዴ', N'Sude')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401132, 4011, N'ቲዮ', N'Tiyo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401234, 4012, N'አሰላ', N'Assela')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401537, 4015, N'ቢሾፍቱ ከተማ አስተዳደር', N'Bishoftu Town Administration')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401640, 4016, N'አሬና ቡሉክ', N'Arena Buluk')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401641, 4016, N'ደቻ', N'Decha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401644, 4016, N'ዲሎ', N'Dilo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401646, 4016, N'ዱብሉክ', N'Dubluk')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401648, 4016, N'ጎሞሌ', N'Gomole')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401650, 4016, N'ጉባ ኮሪቻ', N'Guba Koricha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401653, 4016, N'ኩምቢ', N'Kumbi')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401655, 4016, N'ሚዮ', N'Miyo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401656, 4016, N'ሞያሌ', N'Moyale')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401659, 4016, N'ያባሎ', N'Yabalo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401761, 4017, N'አቢቹ እና ግኒ ወረዳ', N'Abichu And Gnea Woreda')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401764, 4017, N'ቤዴሌ', N'Bedelle')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401766, 4017, N'ቦተር ቶላይ', N'Boter Tolay')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401768, 4017, N'ቾራ', N'Chora')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401770, 4017, N'ዳዌ ሰረር', N'Dawe Serer')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401771, 4017, N'ዴጋ', N'Dega')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401773, 4017, N'ገቺ', N'Gechi')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401875, 4018, N'ቤሮ', N'Bero')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140123, 1401, N'ወረዳ 21', N'Wereda 21')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140126, 1401, N'ወረዳ 24', N'Wereda 24')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140128, 1401, N'ወረዳ 26', N'Wereda 26')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140130, 1401, N'ወረዳ 28', N'Wereda 28')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720301, 7203, N'አመካ', N'Ameka')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720302, 7203, N'አና ሌሞ', N'Ana Lemo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720303, 7203, N'ዱና', N'Duna')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720304, 7203, N'ጊቤ', N'Gibe')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720305, 7203, N'ጎምቦራ', N'Gombora')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720306, 7203, N'ሌሞ', N'Lemo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720307, 7203, N'ምራብ ባዳዋቾ', N'Mirab Badawacho')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720308, 7203, N'ምራብ ሶሮ', N'Mirab Soro')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720309, 7203, N'ሚሻ', N'Misha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720310, 7203, N'ምስራቅ ባዳዋቾ', N'Misrak Badawacho')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720311, 7203, N'ሻሻጎ', N'Shashogo')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720312, 7203, N'ሲራሮ ባዳዋቾ', N'Siraro Badawacho')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720313, 7203, N'ሶሮ', N'Soro')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720601, 7206, N'አሊቾ', N'Alicho')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720602, 7206, N'ዳሎቻ', N'Dalocha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720603, 7206, N'ላንፍሮ', N'Lanfro')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720604, 7206, N'ምራብ አዝርኔት ቤረበሬ', N'Mirab Azernet Berebere')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720605, 7206, N'ምስራቅ አዝርኔት ቤረበሬ', N'Misrak Azernet Berebere')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720606, 7206, N'ምስራቅ ሲልተ', N'Misrak Silte')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720607, 7206, N'ሚቶ', N'Mito')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720608, 7206, N'ሳንኩራ', N'Sankurra')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720609, 7206, N'ሲልቲ', N'Silti')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720610, 7206, N'ዉልባረግ', N'Wulbareg')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222020, 2220, N'ቦንቤ', N'ቦንቤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711001, 7110, N'ቢላተ ዙሪያ', N'Bilate Zuria')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711002, 7110, N'ቦሪቻ', N'Boricha')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711003, 7110, N'ጎርቼ', N'Gorche')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711004, 7110, N'ሀዋሳ ዙሪያ', N'Hawassa Zuria')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711005, 7110, N'ሌኩ', N'Leku')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711006, 7110, N'ማልጋ', N'Malga')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711007, 7110, N'ሸበዲኖ', N'Shebedino')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (711008, 7110, N'ወንዶ ጄኔት', N'Wondo Genet')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710916, 7109, N'ዳዔላ', N'Daela')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710917, 7109, N'ዳዬ', N'Daye')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710918, 7109, N'ሆኮ', N'Hoko')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405517, 4055, N'ዚዋዬ', N'Ziwaye')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730401, 7304, N'ቡሌ ወረዳ', N'Bule wereda')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730402, 7304, N'ዲላ ከተማ', N'Dila Town')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730403, 7304, N'ዲላ ዙሪያ', N'Dila Zuriya')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730404, 7304, N'ጌዴብ ወረዳ', N'Gedeb Woreda')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730405, 7304, N'ኮችሬ ወረዳ', N'Kochere Woreda')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730406, 7304, N'ወናጎ ወረዳ', N'Wenago Woreda')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730407, 7304, N'ይራቼፌ ከተማ', N'Yirachefe Town')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730408, 7304, N'ይራቼፌ ከፈ', N'Yirachefe City/Admin')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730409, 7304, N'ራፐ ወረዳ', N'Raphe Wereda')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730410, 7304, N'ቼሌሌክቲ', N'Chelelekti')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730411, 7304, N'ጌዴብ አስተዳደር', N'Gedeb Administrative')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (730412, 7304, N'ወናጎ አስተዳደር', N'Wonago Administrative')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304723, 3047, N'ደንቢያ', N'Denbya')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301334, 3013, N'ሐሪቡ', N'Haribu')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305088, 3050, N'ኮን', N'Kon')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800101, 8001, N'Aብኦብኦ', N'Aብኦብኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800102, 8001, N'Dአልልኤ Sአድኢ', N'Dአልልኤ Sአድኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800103, 8001, N'Dኢምአ', N'Dኢምአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800104, 8001, N'Gአምብኤልአ Zኡርኢይአ', N'Gአምብኤልአ Zኡርኢይአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800105, 8001, N'Gአምብኤልአ', N'Gአምብኤልአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800106, 8001, N'Gኦግ', N'Gኦግ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800107, 8001, N'Jኦር', N'Jኦር')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800208, 8002, N'Dኤብኡብ Bኤንክህ', N'Dኤብኡብ Bኤንክህ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800209, 8002, N'Gኡርአፍኤርድአ', N'Gኡርአፍኤርድአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800310, 8003, N'Kኦክህኦርኤ', N'Kኦክህኦርኤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800411, 8004, N'Aድኢይኦ', N'Aድኢይኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800412, 8004, N'Iትአንግ', N'Iትአንግ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800513, 8005, N'Kኦልአ Tኤምብይኤን', N'Kኦልአ Tኤምብይኤን')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800614, 8006, N'Gኦድኤርኤ', N'Gኦድኤርኤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800615, 8006, N'Mኤንግኤስህኢ', N'Mኤንግኤስህኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800716, 8007, N'Aክኦብኦ', N'Aክኦብኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800717, 8007, N'Jኢክአውኦ', N'Jኢክአውኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800718, 8007, N'Lአርኤ', N'Lአርኤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800719, 8007, N'Mአክኦይ', N'Mአክኦይ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (800720, 8007, N'Wአንትአውኦ', N'Wአንትአውኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304735, 3047, N'Aዝኤዝኦ', N'Aዝኤዝኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304955, 3049, N'Sህኤንድኢ', N'Sህኤንድኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304956, 3049, N'Wኦግኤርአ', N'Wኦግኤርአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303726, 3037, N'MኤክአንSኤልአም', N'MኤክአንSኤልአም')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303730, 3037, N'Mኤክህአ', N'Mኤክህአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304745, 3047, N'Qኡውአርአ', N'Qኡውአርአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303750, 3037, N'Bኢክህኤንአ', N'Bኢክህኤንአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305030, 3050, N'Bአንጅአ', N'Bአንጅአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304945, 3049, N'Dኤብኤርኤ Bኢርህአን', N'Dኤብኤርኤ Bኢርህአን')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770101, 7701, N'Aስስኦስአ', N'Aስስኦስአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770102, 7701, N'Bአምብአስኢ', N'Bአምብአስኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770103, 7701, N'ዶራኒ', N'ዶራኒ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770104, 7701, N'Hኦምኦስህአ', N'Hኦምኦስህአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770105, 7701, N'Kአድአድኡምአ', N'Kአድአድኡምአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770106, 7701, N'Kኡርምኡክ', N'Kኡርምኡክ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770107, 7701, N'Mኤንግኤ', N'Mኤንግኤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770108, 7701, N'Oድድአ Bኡልድግኢልኡ', N'Oድድአ Bኡልድግኢልኡ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770109, 7701, N'Sህኤርቅኦልኤ', N'Sህኤርቅኦልኤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770199, 7701, N'Wኦርኤድአ Aንድ', N'Wኦርኤድአ Aንድ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770298, 7702, N'Dኢድኤስስአ', N'Dኢድኤስስአ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770397, 7703, N'Kኤምአስህኢ', N'Kኤምአስህኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770496, 7704, N'አምቦ ዙሪያይ', N'አምቦ ዙሪያይ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770595, 7705, N'Dኤብአትኤ', N'Dኤብአትኤ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770694, 7706, N'Aግአልኦ Mኤትኢ', N'Aግአልኦ Mኤትኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770693, 7706, N'Dአንግኡር', N'Dአንግኡር')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770712, 7707, N'Aግአልኦ Mኤትኢ', N'Aግአልኦ Mኤትኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770713, 7707, N'Bኤልልኦ Jኢግአንፍኦይ', N'Bኤልልኦ Jኢግአንፍኦይ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770714, 7707, N'Kኤምአስህኢ', N'Kኤምአስህኢ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770715, 7707, N'Sኤድአል', N'Sኤድአል')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770716, 7707, N'Yአስስኦ', N'Yአስስኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770817, 7708, N'Mአኦ Eንአ Kኦምኦ', N'Mአኦ Eንአ Kኦምኦ')
GO
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (770918, 7709, N'Mኤርኤብ Lኤክኤ', N'Mኤርኤብ Lኤክኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771019, 7710, N'Dኤብአትኤ', N'Dኤብአትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771120, 7711, N'Bኡልኤን', N'Bኡልኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771121, 7711, N'Dአንግኡር', N'Dአንግኡር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771122, 7711, N'Dኤብአትኤ', N'Dኤብአትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771123, 7711, N'Gኡብአ', N'Gኡብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771124, 7711, N'Mአንድኡርአ', N'Mአንድኡርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771125, 7711, N'Pአውኤ', N'Pአውኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (771126, 7711, N'Wኦምብኤርአ', N'Wኦምብኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250101, 2501, N'አዋሽ ከተማ አስተዳደር', N'አዋሽ ከተማ አስተዳደር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250201, 2502, N'Gኤልአልኦ', N'Gኤልአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250302, 2503, N'Aድኤአር', N'Aድኤአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250402, 2504, N'Aምብአስኤል', N'Aምብአስኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250403, 2504, N'Aውአስህ Fኤንትአልኤ', N'Aውአስህ Fኤንትአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250404, 2504, N'Dኤውኤ Hአርአውአ', N'Dኤውኤ Hአርአውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250405, 2504, N'Dኡብትኢ Kኤትኤምአ Aስትኤድአድኤር', N'Dኡብትኢ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250501, 2505, N'Aውአስህ Fኤንትአልኤ', N'Aውአስህ Fኤንትአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250502, 2505, N'Bኦህ', N'Bኦህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250601, 2506, N'Aድኤአር', N'Aድኤአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250701, 2507, N'Aድኦልአ', N'Aድኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250801, 2508, N'Dኤምብኤክህአ', N'Dኤምብኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (250901, 2509, N'Bኢድኡ', N'Bኢድኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251001, 2510, N'ዳርሙ', N'ዳርሙ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251101, 2511, N'Aፍአምብኦ', N'Aፍአምብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251102, 2511, N'Cህኤትአ', N'Cህኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251201, 2512, N'Dአልኦል', N'Dአልኦል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251301, 2513, N'አዋሽ ከተማ አስተዳደር', N'አዋሽ ከተማ አስተዳደር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251401, 2514, N'Aውርአ', N'Aውርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251551, 2515, N'Aድኤአር', N'Aድኤአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251553, 2515, N'Aይስአኢትአ Kኤትኤምአ Aስትኤድአድኤር', N'Aይስአኢትአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251556, 2515, N'Cህኢፍርአ', N'Cህኢፍርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251557, 2515, N'Dኡብትኢ', N'Dኡብትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251503, 2515, N'Dኡልኤስአ', N'Dኡልኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251504, 2515, N'Eልኢድአር', N'Eልኢድአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251506, 2515, N'Kኦርኢ', N'Kኦርኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251601, 2516, N'Aብአልአ Kኤትኤምአ Aስትኤድአድኤር', N'Aብአልአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251688, 2516, N'Aውርአ', N'Aውርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251603, 2516, N'Bኢድኡ', N'Bኢድኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251605, 2516, N'Eርኤብትኢ', N'Eርኤብትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251607, 2516, N'Mኤግአልኤ', N'Mኤግአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251708, 2517, N'Aምኢብአርአ', N'Aምኢብአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251710, 2517, N'Aውአስህ Fኤንትአልኤ', N'Aውአስህ Fኤንትአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251712, 2517, N'Gኤልአልኦ', N'Gኤልአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251814, 2518, N'Aውርአ', N'Aውርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251816, 2518, N'Gኦልኢንአ', N'Gኦልኢንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251818, 2518, N'Yአልኦ', N'Yአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251920, 2519, N'Dኤውኤ', N'Dኤውኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251922, 2519, N'Sኤምኡርኦብኢ', N'Sኤምኡርኦብኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251923, 2519, N'Tኤልአልአክ', N'Tኤልአልአክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140101, 1401, N'ጎዴ ኮውንሲል', N'ጎዴ ኮውንሲል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140106, 1401, N'Wኤርኤድአ 04', N'Wኤርኤድአ 04')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140107, 1401, N'Wኤርኤድአ 05', N'Wኤርኤድአ 05')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140109, 1401, N'Wኤርኤድአ 08', N'Wኤርኤድአ 08')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140201, 1402, N'Mኤንዝ Gኤርአ Mኢድኤርኤ', N'Mኤንዝ Gኤርአ Mኢድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140202, 1402, N'Mኤንዝ Gኤርአ Mኢድኤርኤ', N'Mኤንዝ Gኤርአ Mኢድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140204, 1402, N'Wኤርኤድአ 09', N'Wኤርኤድአ 09')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140301, 1403, N'Wኤርኤድአ 06', N'Wኤርኤድአ 06')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140403, 1404, N'ወረዳ 02', N'ወረዳ 02')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140505, 1405, N'Mኤንዝ Gኤርአ Mኢድኤርኤ', N'Mኤንዝ Gኤርአ Mኢድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140601, 1406, N'Wኤርኤድአ 01', N'Wኤርኤድአ 01')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140603, 1406, N'Wኤርኤድአ 09', N'Wኤርኤድአ 09')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140702, 1407, N'ወረዳ 02', N'ወረዳ 02')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140901, 1409, N'Wኤርኤድአ 11', N'Wኤርኤድአ 11')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141103, 1411, N'Wኤርኤድአ 1', N'Wኤርኤድአ 1')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700101, 7001, N'Dኤብኡብ Bኤንክህ', N'Dኤብኡብ Bኤንክህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700103, 7001, N'Gኤውአትአ', N'Gኤውአትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700105, 7001, N'Mኢዝአን Aምአን Kኤትኤምአ Aስትኤድአድኤር', N'Mኢዝአን Aምአን Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700106, 7001, N'Sኤምኤን Bኤንክህምአጅኢ', N'Sኤምኤን Bኤንክህምአጅኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700108, 7001, N'Sህኤክኦ', N'Sህኤክኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700210, 7002, N'Dኢስአ', N'Dኢስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700212, 7002, N'Gኤንአ', N'Gኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700214, 7002, N'Gኤስአ Cህአርኤ Kኤትኤምአ Aስትኤድአድኤር', N'Gኤስአ Cህአርኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700216, 7002, N'Lኦምአ', N'Lኦምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700218, 7002, N'Mአርኢ Mአንስአ', N'Mአርኢ Mአንስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700219, 7002, N'Tአርክህአ Kኤትኤምአ Aስትኤድአድኤር', N'Tአርክህአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700221, 7002, N'Tኦክህአ', N'Tኦክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700423, 7004, N'Aድኢይኦ', N'Aድኢይኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700425, 7004, N'Bኦንግአ', N'Bኦንግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700427, 7004, N'Cህኤትአ', N'Cህኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700429, 7004, N'Gኤስህአ Dኤክአ', N'Gኤስህአ Dኤክአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700431, 7004, N'Gኢምብኦ', N'Gኢምብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700433, 7004, N'Sአይልኤም', N'Sአይልኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700435, 7004, N'Tኤልኦ', N'Tኤልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700436, 7004, N'Wአክህአ Cኢትይ Aድምኢንኢስትርአትኦር', N'Wአክህአ Cኢትይ Aድምኢንኢስትርአትኦር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700538, 7005, N'Kኦንትአ Lኢይኡ', N'Kኦንትአ Lኢይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700602, 7006, N'Gአክህኢት', N'Gአክህኢት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700604, 7006, N'Mአጅኢ', N'Mአጅኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700677, 7006, N'Mኤንኢት Gኦልድኢአ', N'Mኤንኢት Gኦልድኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700606, 7006, N'Sኡርምአ', N'Sኡርምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700702, 7007, N'Mአስህአ', N'Mአስህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710101, 7101, N'Eስኤርአ', N'Eስኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710201, 7102, N'Kኦክህኦርኤ', N'Kኦክህኦርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710301, 7103, N'Bኦንአ Zኡርኢአ', N'Bኦንአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710401, 7104, N'Dአልኤ', N'Dአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710501, 7105, N'Aድኢስስ Kኤትኤምአ', N'Aድኢስስ Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710504, 7105, N'Hአኢክ Dአር', N'Hአኢክ Dአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710506, 7105, N'Mኤህአል Kኤትኤምአ', N'Mኤህአል Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710507, 7105, N'Mኤንኤህአርይአ', N'Mኤንኤህአርይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710509, 7105, N'Tአብኦር', N'Tአብኦር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710711, 7107, N'አሌታ ቹኮ', N'አሌታ ቹኮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710713, 7107, N'Aልኤትአ Wኦንድኦ', N'Aልኤትአ Wኦንድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710714, 7107, N'Aልኤትአ Wኦንድኦ Cኢትይ Aድምኢን', N'Aልኤትአ Wኦንድኦ Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710716, 7107, N'Bኡርስአ', N'Bኡርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710718, 7107, N'Cህኡክኦ Kኤትኤምአ Aስኤትኤድአድኤር', N'Cህኡክኦ Kኤትኤምአ Aስኤትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710719, 7107, N'ዳራ', N'ዳራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710721, 7107, N'Hኡልአ', N'Hኡልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710801, 7108, N'Aርብኤግኦንአ', N'Aርብኤግኦንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710803, 7108, N'Dአርአርአ', N'Dአርአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710805, 7108, N'Mአልግአ_', N'Mአልግአ_')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710806, 7108, N'Sህአፍአምኦ', N'Sህአፍአምኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710808, 7108, N'Yኢርግአልኤም Cኢትይ Aድምኢን', N'Yኢርግአልኤም Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710910, 7109, N'Bኤንስአ', N'Bኤንስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710912, 7109, N'Bኡርአ', N'Bኡርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710914, 7109, N'Cህኢርኤ', N'Cህኢርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710915, 7109, N'Cህኢርኦንኤ', N'Cህኢርኦንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500102, 5001, N'Aርአርስኦ', N'Aርአርስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500104, 5001, N'Bኤንአ Tስኤምአይ', N'Bኤንአ Tስኤምአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500106, 5001, N'Dኤግኤህአብኡር Cኢትይ Aድምንኢስትርአትኢኦን', N'Dኤግኤህአብኡር Cኢትይ Aድምንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500107, 5001, N'Dኦልኦ Bአይ', N'Dኦልኦ Bአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500110, 5001, N'Hአርኤግኤልኤ', N'Hአርኤግኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500112, 5001, N'Kኦህልኤ', N'Kኦህልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500114, 5001, N'Rአአስኦ', N'Rአአስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500401, 5004, N'Dኤግአምኤድኦ', N'Dኤግአምኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500403, 5004, N'Kአድአድኡምአ', N'Kአድአድኡምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500501, 5005, N'Aርአርስኦ', N'Aርአርስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500503, 5005, N'Gኦርኦ Dኦልአ', N'Gኦርኦ Dኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500505, 5005, N'Kአድአድኡምአ', N'Kአድአድኡምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500507, 5005, N'Mኡብአርኤክ', N'Mኡብአርኤክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500802, 5008, N'Bኦህ', N'Bኦህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500804, 5008, N'Dአርአትኦልኤ', N'Dአርአትኦልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500806, 5008, N'ጌላሄሙር', N'ጌላሄሙር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500807, 5008, N'Lኤህኤል Yኡኦብ', N'Lኤህኤል Yኡኦብ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500808, 5008, N'Wአርድኤር', N'Wአርድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500901, 5009, N'Aብአቅኤርኦ', N'Aብአቅኤርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500902, 5009, N'Aትስብኢ Wኤንብኤርትአ', N'Aትስብኢ Wኤንብኤርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500903, 5009, N'Aውአርኤ', N'Aውአርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500904, 5009, N'Dኤድኦ', N'Dኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500905, 5009, N'Dኤግአምኤድኦ', N'Dኤግአምኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500906, 5009, N'Dኤግኤህአብኡር', N'Dኤግኤህአብኡር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500907, 5009, N'Dኤምብኤል', N'Dኤምብኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500908, 5009, N'Dኦልኦ Aድድኦ', N'Dኦልኦ Aድድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500909, 5009, N'Fኢቅኢ', N'Fኢቅኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500910, 5009, N'Gኡንኤግኤድኦ', N'Gኡንኤግኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500911, 5009, N'Hአምኤርኦ', N'Hአምኤርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500912, 5009, N'Lኤግአህኢድአ', N'Lኤግአህኢድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500913, 5009, N'Mኤይኡ Mኡልኢቅኤ', N'Mኤይኡ Mኡልኢቅኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500914, 5009, N'Qኡብኢ', N'Qኡብኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500915, 5009, N'Sኤልኢህአድ', N'Sኤልኢህአድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500916, 5009, N'Wአንግኤይ', N'Wአንግኤይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500917, 5009, N'Yኦህኦብ', N'Yኦህኦብ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501023, 5010, N'Aብአቅኤርኦ', N'Aብአቅኤርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501024, 5010, N'Aምኡርኡ', N'Aምኡርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501030, 5010, N'አወበራ', N'አወበራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501003, 5010, N'አወበራ', N'አወበራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501004, 5010, N'ባቢሌ', N'ባቢሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501005, 5010, N'Dኤብኡብ Jኢግጅኢግአ', N'Dኤብኡብ Jኢግጅኢግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501006, 5010, N'Dኤክአ Sኦፍትኡ', N'Dኤክአ Sኦፍትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501007, 5010, N'Dኦድኦልአ', N'Dኦድኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501008, 5010, N'Gኦልግኤንኦ', N'Gኦልግኤንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501009, 5010, N'Gኡርስኡም', N'Gኡርስኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501010, 5010, N'Hአርኤውአ', N'Hአርኤውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501012, 5010, N'Hአርስህኢን', N'Hአርስህኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501013, 5010, N'ጂጂጋ', N'ጂጂጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501015, 5010, N'Me' Aso', N'Me' Aso')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501016, 5010, N'Qኤብርኢብኤይአህ', N'Qኤብርኢብኤይአህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501017, 5010, N'Qኦርአን Mኡልአ', N'Qኦርአን Mኡልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501018, 5010, N'Sአብአትአ Hአውአስ', N'Sአብአትአ Hአውአስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501019, 5010, N'Tኦግኦክህአልኤ Cኢትይ Aድምኤንኢስትርአትኢኦን', N'Tኦግኦክህአልኤ Cኢትይ Aድምኤንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501020, 5010, N'Tኡልኡ Gኡልኤድ', N'Tኡልኡ Gኡልኤድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501121, 5011, N'Aርአርስኦ', N'Aርአርስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501122, 5011, N'Aውአርኤ', N'Aውአርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501123, 5011, N'Bኢልኤብኡር', N'Bኢልኤብኡር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501124, 5011, N'Bኡርኢቅኦት', N'Bኡርኢቅኦት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501125, 5011, N'ዳሮር', N'ዳሮር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501126, 5011, N'Dኤግአምኤድኦ', N'Dኤግአምኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501127, 5011, N'Dኤግኤህአብኡር', N'Dኤግኤህአብኡር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501129, 5011, N'Dኤግኤህአብኡር Cኢትይ Aድምንኢስትርአትኢኦን', N'Dኤግኤህአብኡር Cኢትይ Aድምንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501130, 5011, N'Dኢግ', N'Dኢግ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501131, 5011, N'Gአስህአምኦ', N'Gአስህአምኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501132, 5011, N'Gኡንኤግኤድኦ', N'Gኡንኤግኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501133, 5011, N'Yኦአልኤ', N'Yኦአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501201, 5012, N'Gኦብአ', N'Gኦብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501302, 5013, N'Aድአድልኤ', N'Aድአድልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501303, 5013, N'Aይስህአ', N'Aይስህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501304, 5013, N'Bኦድኤልአይ', N'Bኦድኤልአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501305, 5013, N'Dአንአን', N'Dአንአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501306, 5013, N'Dኤብአውአይኢን', N'Dኤብአውአይኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501307, 5013, N'Dኤምብኤል', N'Dኤምብኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501308, 5013, N'Eል_ኦግአድኤን', N'Eል_ኦግአድኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501309, 5013, N'Gኤርብኦ', N'Gኤርብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501310, 5013, N'Gኦግኢልኦ', N'Gኦግኢልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501311, 5013, N'Hኢግኢልኦልአ', N'Hኢግኢልኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501312, 5013, N'Kኤብርኢድኤህአር', N'Kኤብርኢድኤህአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501313, 5013, N'Lአስድኤንክኤርኤ', N'Lአስድኤንክኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501314, 5013, N'Mአርስኢን', N'Mአርስኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501315, 5013, N'Sህአክኦስህ', N'Sህአክኦስህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501316, 5013, N'Sህኢልአብኦ', N'Sህኢልአብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501402, 5014, N'ባቢሌ', N'ባቢሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501404, 5014, N'Dኤክአ Sኦፍትኡ', N'Dኤክአ Sኦፍትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501405, 5014, N'Dኦልኦ Aድድኦ', N'Dኦልኦ Aድድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501407, 5014, N'Gኦርኦ Bኤክኤክስአ', N'Gኦርኦ Bኤክኤክስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501409, 5014, N'Kአርስስአ Dኡልአ', N'Kአርስስአ Dኡልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501701, 5017, N'Aይኡን', N'Aይኡን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501703, 5017, N'Eልውኤይንኤ', N'Eልውኤይንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501705, 5017, N'Hአርአርኤይ', N'Hአርአርኤይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501707, 5017, N'Sአግአግኤ', N'Sአግአግኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501809, 5018, N'Aድአድልኤ', N'Aድአድልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501811, 5018, N'Bኦንአ Zኡርኢአ', N'Bኦንአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501812, 5018, N'Dአንአን', N'Dአንአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501814, 5018, N'Eልኤልልኤ', N'Eልኤልልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501816, 5018, N'Gኦድኤ', N'Gኦድኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501818, 5018, N'Mኡስትአህኢል', N'Mኡስትአህኢል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501902, 5019, N'Aይስህአ', N'Aይስህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501904, 5019, N'Eርኤር', N'Eርኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501907, 5019, N'Gኦትአብኢክኤ', N'Gኦትአብኢክኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501908, 5019, N'MኤAስኦ', N'MኤAስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301537, 3015, N'Bአንብአውኡህአ', N'Bአንብአውኡህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301538, 3015, N'Mኤንአፍኤስህአ Sኡብክኢትይ', N'Mኤንአፍኤስህአ Sኡብክኢትይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301539, 3015, N'Hኦትኤ', N'Hኦትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301540, 3015, N'Sኤግንኦግኤብኤይአ', N'Sኤግንኦግኤብኤይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301601, 3016, N'ጌላሄሙር', N'ጌላሄሙር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301742, 3017, N'አባድር', N'አባድር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301743, 3017, N'አቦከር', N'አቦከር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301744, 3017, N'አቦከር', N'አቦከር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301745, 3017, N'አሚር ኑር', N'አሚር ኑር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301746, 3017, N'አወበራ', N'አወበራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301747, 3017, N'ዳሮር', N'ዳሮር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301748, 3017, N'ዴዋ ቼፋ', N'ዴዋ ቼፋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301749, 3017, N'ጎዴ ኮውንሲል', N'ጎዴ ኮውንሲል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301761, 3017, N'ሃኪም', N'ሃኪም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301762, 3017, N'ሃኪም', N'ሃኪም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301763, 3017, N'ሃኪም', N'ሃኪም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301764, 3017, N'ጂጂጋ', N'ጂጂጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301765, 3017, N'ጂጂጋ', N'ጂጂጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301766, 3017, N'ጂጂጋ', N'ጂጂጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301767, 3017, N'ጂጂጋ', N'ጂጂጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301768, 3017, N'ጂጂጋ', N'ጂጂጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304355, 3043, N'Dኤብርኤ Mአርክኦስ', N'Dኤብርኤ Mአርክኦስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304390, 3043, N'Dኤብአይኤ Tኤልአት Gኤኢን', N'Dኤብአይኤ Tኤልአት Gኤኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305034, 3050, N'Bአትኢ', N'Bአትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304740, 3047, N'Bኤልኤስአ', N'Bኤልኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304966, 3049, N'Gኤብርኤ Mአርኢአም', N'Gኤብርኤ Mአርኢአም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304977, 3049, N'MኤህአልMኤድአ', N'MኤህአልMኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404980, 4049, N'Dኤርብአ', N'Dኤርብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404981, 4049, N'Hኢርንአ', N'Hኢርንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302259, 3022, N'Aድኢህአክኢ', N'Aድኢህአክኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302260, 3022, N'Aርአድአ', N'Aርአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302261, 3022, N'Aዝኤዝኦ Tስኤድአ', N'Aዝኤዝኦ Tስኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302262, 3022, N'ዳራ', N'ዳራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302263, 3022, N'Fአስኢል', N'Fአስኢል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302264, 3022, N'Zኦብኤል Sኡብክኢትይ', N'Zኦብኤል Sኡብክኢትይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302255, 3022, N'Jአንትኤክኤል', N'Jአንትኤክኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302266, 3022, N'Mአርአክኢ', N'Mአርአክኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302301, 3023, N'አንጎለላነታራ', N'አንጎለላነታራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302401, 3024, N'ደሃና', N'ደሃና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302402, 3024, N'ዴዋ ቼፋ', N'ዴዋ ቼፋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302403, 3024, N'ኤኖሞር ኤና ኤነር', N'ኤኖሞር ኤና ኤነር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405060, 4050, N'Tኢክኡር Iንክህኢንኢ', N'Tኢክኡር Iንክህኢንኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405645, 4056, N'Dኡግድአንአ Bኦርአ', N'Dኡግድአንአ Bኦርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302601, 3026, N'አሪቱማ ፉርሲ', N'አሪቱማ ፉርሲ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302701, 3027, N'ኤነማይ', N'ኤነማይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405640, 4056, N'Sአአይኤ', N'Sአአይኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302901, 3029, N'Gኤርአ', N'Gኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302902, 3029, N'ላሎቂሌ', N'ላሎቂሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (302903, 3029, N'ኖኖ ቤንጃ', N'ኖኖ ቤንጃ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303401, 3034, N'Aልኤፍአ', N'Aልኤፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303402, 3034, N'Aልኤፍአ', N'Aልኤፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303486, 3034, N'Aልኤፍአ', N'Aልኤፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303487, 3034, N'Aርብኤግኦንአ', N'Aርብኤግኦንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303488, 3034, N'Bአስስኦ Eንአ Wኤርኤንአ', N'Bአስስኦ Eንአ Wኤርኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303489, 3034, N'Cህኢልግአ', N'Cህኢልግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303490, 3034, N'Gኦንድኤር Zኡርኢይአ', N'Gኦንድኤር Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303422, 3034, N'Kኢንፍአዝ Bኤግኤልአ', N'Kኢንፍአዝ Bኤግኤልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303421, 3034, N'Lአይ Aርምአክህኢህኦ', N'Lአይ Aርምአክህኢህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303493, 3034, N'Mኤትኤምአ', N'Mኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303491, 3034, N'Mኢርአብብኤልኤስአ', N'Mኢርአብብኤልኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303492, 3034, N'Mኢርአብድኤምብኢይአ', N'Mኢርአብድኤምብኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303423, 3034, N'Mኢስርአክ Dኤምብኢይአ', N'Mኢስርአክ Dኤምብኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303495, 3034, N'Rአይአ Kኦብኦ', N'Rአይአ Kኦብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303496, 3034, N'Tአክህኢ Aርምአክህኢህኦ', N'Tአክህኢ Aርምአክህኢህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303497, 3034, N'Tአክኡስአ', N'Tአክኡስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303498, 3034, N'Tኤግኤድኢኤ', N'Tኤግኤድኢኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303725, 3037, N'Bአህኢርድአር Zኡርኢይአ', N'Bአህኢርድአር Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303705, 3037, N'Bኡርኢኤ Kኤትኤምአ Aስትኤድአድኤር', N'Bኡርኢኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303706, 3037, N'Bኡርኢኤ Zኡርኢአ', N'Bኡርኢኤ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303708, 3037, N'Dኤብኡብ Mኤክህአ', N'Dኤብኡብ Mኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303709, 3037, N'Dኤግአ Dአምኦት', N'Dኤግአ Dአምኦት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303711, 3037, N'Dኤምብኤክህአ Kኤትኤምአ Aስትኤድአድኤር', N'Dኤምብኤክህአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303713, 3037, N'Gኦንጅኤ Kኦልኤልአ', N'Gኦንጅኤ Kኦልኤልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303714, 3037, N'Hአልኢክህኦ Wኢርኢርኦኦ', N'Hአልኢክህኦ Wኢርኢርኦኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303715, 3037, N'Jኤብኢትኤህንአን', N'Jኤብኢትኤህንአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303717, 3037, N'Qኡአርኢት', N'Qኡአርኢት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303718, 3037, N'ሳሲጋ', N'ሳሲጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303720, 3037, N'Sኤምኤን Aክህኤፍኤር', N'Sኤምኤን Aክህኤፍኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303722, 3037, N'Tስኤግኤድኤ', N'Tስኤግኤድኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303723, 3037, N'Wኦምብኤርምአ', N'Wኦምብኤርምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303825, 3038, N'Bኤድኤንኦ', N'Bኤድኤንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303826, 3038, N'Dኡህኡን', N'Dኡህኡን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303828, 3038, N'Mኤትኤምአ', N'Mኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303830, 3038, N'Qኡአርአ', N'Qኡአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304336, 3043, N'Aንኤድኤድ', N'Aንኤድኤድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304338, 3043, N'Bአስኦ_ልኢብኤን', N'Bአስኦ_ልኢብኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304340, 3043, N'Bኢብኡግን', N'Bኢብኡግን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304342, 3043, N'Dኤብርኤ Bኢርህአን', N'Dኤብርኤ Bኢርህአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304343, 3043, N'Dኤብርኤ Eልኢአስ', N'Dኤብርኤ Eልኢአስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304345, 3043, N'Dኤጅኤን', N'Dኤጅኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304346, 3043, N'Eንአርጅኢ Eንአ Eንአውኡግአ', N'Eንአርጅኢ Eንአ Eንአውኡግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304348, 3043, N'ኤነማይ', N'ኤነማይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304349, 3043, N'Gአዝኦ', N'Gአዝኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304385, 3043, N'Gኦዝአምኤን', N'Gኦዝአምኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304392, 3043, N'Gኡብአልአፍትኦ', N'Gኡብአልአፍትኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304387, 3043, N'Mአክህአክኤል', N'Mአክህአክኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304389, 3043, N'Sኤድኤ', N'Sኤድኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304399, 3043, N'Sህኤብኤል Bኤርኤንትአ', N'Sህኤብኤል Bኤርኤንትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304391, 3043, N'Sኢንአን', N'Sኢንአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304513, 3045, N'አቢቹ እና ግኒ ወረዳ', N'አቢቹ እና ግኒ ወረዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304515, 3045, N'አሪቱማ ፉርሲ', N'አሪቱማ ፉርሲ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304517, 3045, N'Bአትኢ Kኤትኤምአ Aስትኤድአድኤር', N'Bአትኢ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304519, 3045, N'Dኤውኤ Hአርአውአ', N'Dኤውኤ Hአርአውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304520, 3045, N'Hአግኤርኤ Mአርይአም Kኤስኤም', N'Hአግኤርኤ Mአርይአም Kኤስኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304522, 3045, N'Kኤምኢስስኤ', N'Kኤምኢስስኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304701, 3047, N'Aድኢ Aርክአይ', N'Aድኢ Aርክአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304702, 3047, N'Aድኢ Aርክአይ', N'Aድኢ Aርክአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304724, 3047, N'Aድኢ Aርክአይ', N'Aድኢ Aርክአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304726, 3047, N'ቦዲቲ ከተማ', N'ቦዲቲ ከተማ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304728, 3047, N'Dኤብአርክ', N'Dኤብአርክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304730, 3047, N'ሀዲጋላ', N'ሀዲጋላ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304731, 3047, N'Jአንአምኦርአ', N'Jአንአምኦርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304732, 3047, N'Tኤልኤምኢት', N'Tኤልኤምኢት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304914, 3049, N'Aልኤምክኤትኤምአ Tኦውን Aድምኢንስ', N'Aልኤምክኤትኤምአ Tኦውን Aድምኢንስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304916, 3049, N'አንጎለላነታራ', N'አንጎለላነታራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304917, 3049, N'Aንክኦብኤር', N'Aንክኦብኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304919, 3049, N'Aርኤርትኢ Tኦውን Aድምኢንኢስትርአትኢኦን', N'Aርኤርትኢ Tኦውን Aድምኢንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304921, 3049, N'Bአስስኦ Eንአ Wኤርኤንአ', N'Bአስስኦ Eንአ Wኤርኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304923, 3049, N'Bኡልግአ Tኦውን Aድምኢንኢስትርአትኢኦን', N'Bኡልግአ Tኦውን Aድምኢንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304924, 3049, N'Dኤብርኤ ስኢንአ Tኦውን Aድምኢን', N'Dኤብርኤ ስኢንአ Tኦውን Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304926, 3049, N'Eፍርአትአንአ Gኢድኢም', N'Eፍርአትአንአ Gኢድኢም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304927, 3049, N'Eንስአርኦ', N'Eንስአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304929, 3049, N'Hአግኤርኤ Mአርይአም Kኤስኤም', N'Hአግኤርኤ Mአርይአም Kኤስኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304989, 3049, N'Mኤንዝ Gኤርአ Mኢድኤርኤ', N'Mኤንዝ Gኤርአ Mኢድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304932, 3049, N'Mኤንዝልአልኦ', N'Mኤንዝልአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304933, 3049, N'Mኤርኤህአብኤትኢኤ', N'Mኤርኤህአብኤትኢኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304935, 3049, N'Mኢንጅአር Sህኦንክኦርአ', N'Mኢንጅአር Sህኦንክኦርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304936, 3049, N'Mኦጅአ ኤንአ ውኤድኤርአ', N'Mኦጅአ ኤንአ ውኤድኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304938, 3049, N'Mኦልአልኤ Tኦውን Aድምኢንኢስትርአትኢኦን', N'Mኦልአልኤ Tኦውን Aድምኢንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304939, 3049, N'Mኦርኤትንአ Jኢርኡ', N'Mኦርኤትንአ Jኢርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304941, 3049, N'Sህኤውአርኦብኢት Tኦውን Aድምኢንኢስትርአትኢኦን', N'Sህኤውአርኦብኢት Tኦውን Aድምኢንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304942, 3049, N'Tአርምአብኤር', N'Tአርምአብኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305013, 3050, N'Bኡግንአ', N'Bኡግንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305015, 3050, N'Gአዝኦ', N'Gአዝኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305017, 3050, N'Gኡብአልአፍትኦ', N'Gኡብአልአፍትኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305019, 3050, N'Kኦብኦ Kኤትኤምአ', N'Kኦብኦ Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305021, 3050, N'Lአስትአ', N'Lአስትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305022, 3050, N'Mኤክኤት', N'Mኤክኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305024, 3050, N'Rአይአ Kኦብኦ', N'Rአይአ Kኦብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305025, 3050, N'Wአድኢልአ', N'Wአድኢልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305026, 3050, N'Wኤልድኢይአ Kኤትኤምአ Aስትኤድአድኤር', N'Wኤልድኢይአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305128, 3051, N'ደሃና', N'ደሃና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305130, 3051, N'Sአህልአ Sኤይኤምት', N'Sአህልአ Sኤይኤምት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305132, 3051, N'Tስአግኢብኢግኤ', N'Tስአግኢብኢግኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305133, 3051, N'Zኢክኡአልአ', N'Zኢክኡአልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300201, 3002, N'Aብብኢ Aድድይ', N'Aብብኢ Aድድይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300203, 3002, N'Aይኤህኡ Gኡአግኡስአ', N'Aይኤህኡ Gኡአግኡስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300204, 3002, N'Bአንጅአ Sህኢግኡድአድ', N'Bአንጅአ Sህኢግኡድአድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300206, 3002, N'Dአንግኢልአ', N'Dአንግኢልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300207, 3002, N'Dአንግልአ Kኤትኤምአ Aስትኤድአድኤር', N'Dአንግልአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300208, 3002, N'Dኤምብኤክህአ', N'Dኤምብኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300210, 3002, N'Dኢትአ', N'Dኢትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300212, 3002, N'Eንጅኢብአርአ Kኤትኤምአ Aስትኤድአድኤር', N'Eንጅኢብአርአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300214, 3002, N'Gኡአግኡስአስህኤክኡድአድ', N'Gኡአግኡስአስህኤክኡድአድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300216, 3002, N'Jአውኢ', N'Jአውኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300217, 3002, N'Zኢግኤም', N'Zኢግኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300309, 3003, N'Aርአድአ', N'Aርአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300303, 3003, N'Bአህኢርድአር Kኤትኤምአ', N'Bአህኢርድአር Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300304, 3003, N'Bአንብአውኡህአ', N'Bአንብአውኡህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300306, 3003, N'Gኢንብኦት 20', N'Gኢንብኦት 20')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300307, 3003, N'Gኢስህኤ Aብአይ', N'Gኢስህኤ Aብአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300901, 3009, N'Aብአስህኢግኤ', N'Aብአስህኢግኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300903, 3009, N'Aልአምአትአ', N'Aልአምአትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300905, 3009, N'Aምብአስኤል', N'Aምብአስኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300946, 3009, N'Aንድአብኤት', N'Aንድአብኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300948, 3009, N'Dአርኦ Lአብኡ', N'Dአርኦ Lአብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300949, 3009, N'Dኤብርኤ Tአብኦር', N'Dኤብርኤ Tአብኦር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300951, 3009, N'Dኤርአ', N'Dኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300953, 3009, N'Dኢርኤ Dአውአ Aስትኤድአድአር', N'Dኢርኤ Dአውአ Aስትኤድአድአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300955, 3009, N'Eስትኢኤ', N'Eስትኢኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300956, 3009, N'Fኦግኤርአ', N'Fኦግኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300958, 3009, N'ኪንዶ ዲዳዬ', N'ኪንዶ ዲዳዬ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300959, 3009, N'Lአይ Gአይኢንት', N'Lአይ Gአይኢንት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300961, 3009, N'Mኤክአንኤ Eይኤስኡስ', N'Mኤክአንኤ Eይኤስኡስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300962, 3009, N'Mኤክድኤልአ', N'Mኤክድኤልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300964, 3009, N'Nኢፍአስ Mኤውክህአ', N'Nኢፍአስ Mኤውክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300966, 3009, N'Sኢምአድአ', N'Sኢምአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300968, 3009, N'Tኦግኦክህአልኤ Cኢትይ Aድምኢን', N'Tኦግኦክህአልኤ Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300969, 3009, N'Wኦርኤትአ', N'Wኦርኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301102, 3011, N'Dኤግኡአ Tኤምብኤን', N'Dኤግኡአ Tኤምብኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301301, 3013, N'Aብብኢ Aድድይ', N'Aብብኢ Aድድይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301380, 3013, N'Aድኤአ Bኤርግአ', N'Aድኤአ Bኤርግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301382, 3013, N'Aልኤትአ Wኦንድኦ Cኢትይ Aድምኢን', N'Aልኤትአ Wኦንድኦ Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301384, 3013, N'Aምብአስኤል', N'Aምብአስኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301386, 3013, N'አሪቱማ ፉርሲ', N'አሪቱማ ፉርሲ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301387, 3013, N'Aስአግርት', N'Aስአግርት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301389, 3013, N'Bኡልኤ', N'Bኡልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301391, 3013, N'ደቻ', N'ደቻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301347, 3013, N'Dኤጅኤን', N'Dኤጅኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301395, 3013, N'Dኤልአንትአ', N'Dኤልአንትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301397, 3013, N'Dኤስስኢኤ Zኡርኢይአ', N'Dኤስስኢኤ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301348, 3013, N'Eርኤር', N'Eርኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301340, 3013, N'Gኤምኤክህኢስ', N'Gኤምኤክህኢስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301346, 3013, N'Gኦምምአ', N'Gኦምምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301350, 3013, N'Hአኢክ', N'Hአኢክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301312, 3013, N'ሀሬማያ', N'ሀሬማያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301314, 3013, N'Jአንትኤክኤል', N'Jአንትኤክኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301316, 3013, N'Kአርአትኤ_Zኡርኢአ', N'Kአርአትኤ_Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301310, 3013, N'Kኤርስአ', N'Kኤርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301319, 3013, N'Kኦምብኦልክህአ Kኤትኤምአ Aስትኤድአድኤር', N'Kኦምብኦልክህአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301320, 3013, N'Kኡትአብኤር', N'Kኡትአብኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301321, 3013, N'Lኤግኤህኢድአ', N'Lኤግኤህኢድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301323, 3013, N'Mኤክድኤልአ', N'Mኤክድኤልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301325, 3013, N'Tኤህኡልኤድኤርኤ', N'Tኤህኡልኤድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301326, 3013, N'Tኤንኤትአ', N'Tኤንኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301342, 3013, N'Wኤርኤብአብኦ', N'Wኤርኤብአብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301330, 3013, N'Wኦግድኢኤ', N'Wኦግድኢኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300135, 3015, N'Aርአድአ', N'Aርአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301535, 3015, N'Aርአድአ', N'Aርአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100801, 1008, N'Aልአጅኤ', N'Aልአጅኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100802, 1008, N'Aስኤግኤድኤ Tስኢምብኢልአ', N'Aስኤግኤድኤ Tስኢምብኢልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100804, 1008, N'Dኤግኡአ Tኤምብኤን', N'Dኤግኡአ Tኤምብኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100805, 1008, N'Eንድኤርትአ', N'Eንድኤርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100807, 1008, N'Hኢንትአልኦ Wአጅኢርአት', N'Hኢንትአልኦ Wአጅኢርአት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100206, 1002, N'Aድውአ', N'Aድውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100207, 1002, N'Aልአጅኤ', N'Aልአጅኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100208, 1002, N'Aልአምአትአ', N'Aልአምአትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100210, 1002, N'Eንድአምኤህኦንኢ', N'Eንድአምኤህኦንኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100212, 1002, N'Mአይክህኤው', N'Mአይክህኤው')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100214, 1002, N'Rአይአ Aዝኤብኦ', N'Rአይአ Aዝኤብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100316, 1003, N'Aድውአ', N'Aድውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100318, 1003, N'Aህኢፍኤርኦም', N'Aህኢፍኤርኦም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100320, 1003, N'Aክስኡም', N'Aክስኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100321, 1003, N'Gአንትአ Aፍኤስህኡም', N'Gአንትአ Aፍኤስህኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100323, 1003, N'Kኦልአ Tኤምብይኤን', N'Kኦልአ Tኤምብይኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100324, 1003, N'Lአኤልአይ Mአይክህኤው', N'Lአኤልአይ Mአይክህኤው')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100326, 1003, N'Nአድኤር Aድኤት', N'Nአድኤር Aድኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100328, 1003, N'Tአህትአይምአይክህኤው', N'Tአህትአይምአይክህኤው')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100329, 1003, N'Tአንቅኡአ Aብኤርግኤልኤ', N'Tአንቅኡአ Aብኤርግኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100431, 1004, N'Aድኢህአክኢ', N'Aድኢህአክኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100433, 1004, N'Aይድኤር', N'Aይድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100806, 1008, N'Hአድንኤት', N'Hአድንኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100435, 1004, N'Kኤድአምአይ Wኤይአንኤ', N'Kኤድአምአይ Wኤይአንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100437, 1004, N'Sኤምኤን', N'Sኤምኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100531, 1005, N'Sኤትኢት Hኡምኤርአ', N'Sኤትኢት Hኡምኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100539, 1005, N'Tአህትአይ Qኦርአርኦ', N'Tአህትአይ Qኦርአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100540, 1005, N'Tስኤግኤድኤ', N'Tስኤግኤድኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100541, 1005, N'Wኤልክአይኢት', N'Wኤልክአይኢት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100642, 1006, N'Aድኢግርአት', N'Aድኢግርአት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100643, 1006, N'Aትስብኢ Wኤንብኤርትአ', N'Aትስብኢ Wኤንብኤርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100644, 1006, N'Eርኦብ', N'Eርኦብ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100645, 1006, N'Gአንትአ Aፍኤስህኡም', N'Gአንትአ Aፍኤስህኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100646, 1006, N'Gኡልኦ Mኤህኤድአ', N'Gኡልኦ Mኤህኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100647, 1006, N'Hአውኡዝኤን', N'Hአውኡዝኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100648, 1006, N'Kኢልትኤ Aውልአልኦ', N'Kኢልትኤ Aውልአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100649, 1006, N'Sአኤስኢ Tስአድአምብአ', N'Sአኤስኢ Tስአድአምብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100650, 1006, N'Wኡክርኦ', N'Wኡክርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100751, 1007, N'Aስኤግኤድኤ Tስኢምብኢልአ', N'Aስኤግኤድኤ Tስኢምብኢልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100752, 1007, N'Lአኤልአይ Aድኢይአብኦ', N'Lአኤልአይ Aድኢይአብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100753, 1007, N'Mኤድኤብአይ Zአንአ', N'Mኤድኤብአይ Zአንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100754, 1007, N'Sህኢርአርኦ', N'Sህኢርአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100755, 1007, N'Sህኢርኤ Eንድአ Sኢልአስስኢኤ', N'Sህኢርኤ Eንድአ Sኢልአስስኢኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100756, 1007, N'Tአህትአይ Aድኢይአብኦ', N'Tአህትአይ Aድኢይአብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100757, 1007, N'Tአህትአይ Qኦርአርኦ', N'Tአህትአይ Qኦርአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100758, 1007, N'Tስኤልኤምት', N'Tስኤልኤምት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220101, 2201, N'አሌ ሊዩ ወረዳ', N'አሌ ሊዩ ወረዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220202, 2202, N'Aምአርኦ Lኢይኡ Wኤርኤድአ', N'Aምአርኦ Lኢይኡ Wኤርኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220303, 2203, N'Bአስክኤትኦ', N'Bአስክኤትኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220401, 2204, N'Aንድርአክህአ', N'Aንድርአክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220402, 2204, N'Gኤትአ', N'Gኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220501, 2205, N'Bኡርጅኢ Lኢይኡ Wኤርኤድአ', N'Bኡርጅኢ Lኢይኡ Wኤርኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220601, 2206, N'ቦሎሶቦምቤ', N'ቦሎሶቦምቤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220602, 2206, N'Dኢትአ', N'Dኢትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220603, 2206, N'Eስኤርአ', N'Eስኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220701, 2207, N'Bኤንአ Tስኤምአይ', N'Bኤንአ Tስኤምአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220702, 2207, N'Dአስኤንኤክህ', N'Dአስኤንኤክህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220703, 2207, N'Dኤብኡብ Aርኢ', N'Dኤብኡብ Aርኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220704, 2207, N'Gኤድኤብአንኦ Gኡትአዝአር Wኤልኤንኤ', N'Gኤድኤብአንኦ Gኡትአዝአር Wኤልኤንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220705, 2207, N'Hአምኤር', N'Hአምኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220706, 2207, N'Jኢንክአ Kኤትኤምአ Aስትኤድአድኤር', N'Jኢንክአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220707, 2207, N'Mአልልኤ', N'Mአልልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220708, 2207, N'Nይአንግአትኦም', N'Nይአንግአትኦም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220709, 2207, N'Sአልአምአግኦ', N'Sአልአምአግኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220710, 2207, N'Sኤምኤን Aርኢ', N'Sኤምኤን Aርኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220811, 2208, N'Aልአጅኤ', N'Aልአጅኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (220912, 2209, N'Dኢርአስህኤ Lኢይኡ Wኤርኤድአ', N'Dኢርአስህኤ Lኢይኡ Wኤርኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221001, 2210, N'Dኢልልአ Bኤድኤክህአ Tኦውን', N'Dኢልልአ Bኤድኤክህአ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221002, 2210, N'Dኢልልአ Hአርኦውኤልአብኦ Tኦውን', N'Dኢልልአ Hአርኦውኤልአብኦ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221003, 2210, N'Dኢልልአ Sኤስስአ Tኦውን', N'Dኢልልአ Sኤስስአ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221101, 2211, N'Aድኢይኦ', N'Aድኢይኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221102, 2211, N'Aርብአ Mኢንክህ Kኤትኤምአ Aስትኤድኤድአድኤር', N'Aርብአ Mኢንክህ Kኤትኤምአ Aስትኤድኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221103, 2211, N'Aርብአምኢንክህ Zኡርኢይአ', N'Aርብአምኢንክህ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221104, 2211, N'Bአብአ_Gአክህኦ', N'Bአብአ_Gአክህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221105, 2211, N'Bኢርብኢር Kኤትኤምአ Aስትኤድአድኤር', N'Bኢርብኢር Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221106, 2211, N'Bኦንክኤ', N'Bኦንክኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221107, 2211, N'Bኦርኤድአ', N'Bኦርኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221108, 2211, N'Cህኤንክህአ Kኤትኤምአ Aስኤትኤድአድኤር', N'Cህኤንክህአ Kኤትኤምአ Aስኤትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221109, 2211, N'Cህኤንክህአ Zኡርኢይአ', N'Cህኤንክህአ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221110, 2211, N'Dኤርኤምአልኦ', N'Dኤርኤምአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221131, 2211, N'Dኢልልአ Zኡርኢአ', N'Dኢልልአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221111, 2211, N'Dኢትአ', N'Dኢትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221166, 2211, N'Gአክህኦ_Bአብአ', N'Gአክህኦ_Bአብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221112, 2211, N'Gአርድአ Mአርትአ', N'Gአርድአ Mአርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221113, 2211, N'Gኤርኤስስኤ', N'Gኤርኤስስኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221114, 2211, N'Gኤርኤስስኤ Kኤትኤምአ Aስትኤድአድኤር', N'Gኤርኤስስኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221115, 2211, N'Kኤምብአ', N'Kኤምብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221116, 2211, N'Kኤምብአ Kኤትኤምአ Aስትኤድአድኤር', N'Kኤምብአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221117, 2211, N'Kኢልትኤ Aውልአልኦ', N'Kኢልትኤ Aውልአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221119, 2211, N'Mኢስርአክ Aዝኤርንኤት', N'Mኢስርአክ Aዝኤርንኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221120, 2211, N'Qኦግኦትአ', N'Qኦግኦትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221123, 2211, N'Qኡክህአ Aልፍአ', N'Qኡክህአ Aልፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221225, 2212, N'Bኡልኤ', N'Bኡልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221226, 2212, N'Dኢልልአ Zኡርኢአ', N'Dኢልልአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221227, 2212, N'Gኤድኤብ', N'Gኤድኤብ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221229, 2212, N'Wኦንአግኦ', N'Wኦንአግኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221231, 2212, N'Yኢርግአ Cህኤፍኤ Cኢትይ Aድምኢን', N'Yኢርግአ Cህኤፍኤ Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221333, 2213, N'Cህኤንአ', N'Cህኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221334, 2213, N'Dኤንብአ Gኦፍአ', N'Dኤንብአ Gኦፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221335, 2213, N'Gኤዝኤ Gኦፍአ', N'Gኤዝኤ Gኦፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221337, 2213, N'Mአስህአ', N'Mአስህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221338, 2213, N'Mኤልኦ Kኦዝአ', N'Mኤልኦ Kኦዝአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221339, 2213, N'Oይኢድአ', N'Oይኢድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221341, 2213, N'Uብአ Dኤብርኤትስኤህአይ', N'Uብአ Dኤብርኤትስኤህአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221443, 2214, N'Aብአስህኢግኤ', N'Aብአስህኢግኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221444, 2214, N'Bኡትአጅኢርአ Kኤትኤምአ Aስትኤድአድኤር', N'Bኡትአጅኢርአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221446, 2214, N'Dኤብኡብ Sኦድኦ', N'Dኤብኡብ Sኦድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221448, 2214, N'Eንድኤግአግን', N'Eንድኤግአግን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221449, 2214, N'ኤኖሞር ኤና ኤነር', N'ኤኖሞር ኤና ኤነር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221451, 2214, N'Gኤድኤብአንኦ Gኡትአዝአር Wኤልኤንኤ', N'Gኤድኤብአንኦ Gኡትአዝአር Wኤልኤንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221453, 2214, N'Gኡምኤር', N'Gኡምኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221455, 2214, N'Kአብኤንአ', N'Kአብኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221457, 2214, N'Mኤስክአን', N'Mኤስክአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221459, 2214, N'Mኢስርአክ Mኤስክአን', N'Mኢስርአክ Mኤስክአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221460, 2214, N'Sኦድኦ', N'Sኦድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221562, 2215, N'አመካ', N'አመካ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221563, 2215, N'አመካ', N'አመካ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221564, 2215, N'Aንአልኤምምኦ', N'Aንአልኤምምኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221566, 2215, N'Cህኤትአ', N'Cህኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221568, 2215, N'ዱና', N'ዱና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221569, 2215, N'Gኤምብኦርአ', N'Gኤምብኦርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221572, 2215, N'ሊሙ', N'ሊሙ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221573, 2215, N'Mኤርአብ Bአድአውአክህኦ', N'Mኤርአብ Bአድአውአክህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221575, 2215, N'ሚሻ', N'ሚሻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221577, 2215, N'Sአንክኡርአ', N'Sአንክኡርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221578, 2215, N'Sህአስህኤግኦ', N'Sህአስህኤግኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221580, 2215, N'ሶሮ', N'ሶሮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221681, 2216, N'Aትኦትኤ Uልኤ', N'Aትኦትኤ Uልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221683, 2216, N'Wኤርአ', N'Wኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221785, 2217, N'Aድኢልኦኦ Zኡርኢይአ', N'Aድኢልኦኦ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221786, 2217, N'Aንግኤክህአ', N'Aንግኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221788, 2217, N'ዳሞትጋሌ', N'ዳሞትጋሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221790, 2217, N'Dኡርአምኤ Cኢትይ Aድምኢን', N'Dኡርአምኤ Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221792, 2217, N'Hአድአርኦ Tኡንትኦ', N'Hአድአርኦ Tኡንትኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221793, 2217, N'Kአክህአብኢርአ', N'Kአክህአብኢርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221794, 2217, N'Kኤድኢድአ Gአምኤልልአ', N'Kኤድኢድአ Gአምኤልልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221796, 2217, N'Tኤምብአርኦ', N'Tኤምብአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221802, 2218, N'Kአርአትኤ_Zኡርኢአ', N'Kአርአትኤ_Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221803, 2218, N'Kኤንአ', N'Kኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221805, 2218, N'Sኤግኤን_Zኡርኢይአ', N'Sኤግኤን_Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221901, 2219, N'Dአልልኦክህአ', N'Dአልልኦክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221903, 2219, N'Hኡልብአርኤግ', N'Hኡልብአርኤግ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221904, 2219, N'Kኤብኤት Kኤትኤምአ Aስትኤድአድኤር', N'Kኤብኤት Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221906, 2219, N'Mኢኤርኤብ Aዝኤርንኤት Bኤርብኤርኤ', N'Mኢኤርኤብ Aዝኤርንኤት Bኤርብኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221908, 2219, N'Mኢስርአክ Sኢልኢትኤ', N'Mኢስርአክ Sኢልኢትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221910, 2219, N'Sአንክኡርአ', N'Sአንክኡርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221912, 2219, N'Wኦርአብኤ Tኦውን Aድምኢንስትርአትኢኦን', N'Wኦርአብኤ Tኦውን Aድምኢንስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222002, 2220, N'አረካ ከተማ አስተዳደር', N'አረካ ከተማ አስተዳደር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222004, 2220, N'ቦዲቲ ከተማ', N'ቦዲቲ ከተማ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222005, 2220, N'ቦሎሶ ሶሬ', N'ቦሎሶ ሶሬ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222007, 2220, N'ዳሞት ሶሬ', N'ዳሞት ሶሬ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222008, 2220, N'ዳሞት ዌይዴ', N'ዳሞት ዌይዴ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222010, 2220, N'ዳሞትፑላሳ', N'ዳሞትፑላሳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222012, 2220, N'ሆቢቻ አባያ', N'ሆቢቻ አባያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222014, 2220, N'ካዎ ኮይሻ', N'ካዎ ኮይሻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222016, 2220, N'ኪንዶ ኮይሻ', N'ኪንዶ ኮይሻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222017, 2220, N'ኦፋ', N'ኦፋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222019, 2220, N'ሶዶ ዙሪያ', N'ሶዶ ዙሪያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222101, 2221, N'Yኤም Lኢይኡ', N'Yኤም Lኢይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221579, 2215, N'Sኢርአርኦ Bአድውአክህኦ', N'Sኢርአርኦ Bአድውአክህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300218, 3002, N'Cህአግንኢ', N'Cህአግንኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401876, 4018, N'Bኡርአይኡ Gአፍአርስአ', N'Bኡርአይኡ Gአፍአርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401810, 4018, N'Gአፍአርስአ Gኡጅኤ', N'Gአፍአርስአ Gኡጅኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401878, 4018, N'Kአትትአ Aርኤርአ', N'Kአትትአ Aርኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401811, 4018, N'Mአልክአ Nኦንንኦ', N'Mአልክአ Nኦንንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402181, 4021, N'አሜያ', N'አሜያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402183, 4021, N'Dአውኦ', N'Dአውኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402185, 4021, N'Iልኡ', N'Iልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402187, 4021, N'Mአንአ Sኢብኡ', N'Mአንአ Sኢብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402189, 4021, N'Sኦድኦ Dአክህኢ', N'Sኦድኦ Dአክህኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402190, 4021, N'Tኦልኤ', N'Tኦልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402192, 4021, N'ወሊሶ', N'ወሊሶ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402702, 4027, N'Dኡክአም', N'Dኡክአም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403120, 4031, N'አባያ', N'አባያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403111, 4031, N'Aድኦልአ Wአይኡ Kኤትኤምአ', N'Aድኦልአ Wአይኡ Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403114, 4031, N'Aንአስኦርአ', N'Aንአስኦርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403116, 4031, N'Cህኤትአ', N'Cህኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403117, 4031, N'Gኤርኤጅአ', N'Gኤርኤጅአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403119, 4031, N'Gኡምኢ Eልድአልኦ', N'Gኡምኢ Eልድአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403121, 4031, N'Lኤግአህኢድአ', N'Lኤግአህኢድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403122, 4031, N'Lኢብኤን', N'Lኢብኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403124, 4031, N'Oድኦ Sህአክኢስኦ', N'Oድኦ Sህአክኢስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403125, 4031, N'Sኤብአ Bኦርኡ', N'Sኤብአ Bኦርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403127, 4031, N'Uርአግአ', N'Uርአግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403128, 4031, N'Wአድአርአ', N'Wአድአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403702, 4037, N'Aብአይክህኦምአን', N'Aብአይክህኦምአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403704, 4037, N'Aምኡርኡ', N'Aምኡርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403705, 4037, N'Cህኤምኦን Gኡድኡርኡ', N'Cህኤምኦን Gኡድኡርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403707, 4037, N'Hአብአብኦግኡድኡርኡ', N'Hአብአብኦግኡድኡርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403709, 4037, N'Hኦርኦ Bኡልኡክ', N'Hኦርኦ Bኡልኡክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403711, 4037, N'Jአርድአግአ Jአርትኤ', N'Jአርድአግአ Jአርትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403712, 4037, N'Jኢምአርአርኤ', N'Jኢምአርአርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403713, 4037, N'Jኢምምአግኤንአትኤ', N'Jኢምምአግኤንአትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403999, 4039, N'Aግአርኦ', N'Aግአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403906, 4039, N'ቦተር ቶላይ', N'ቦተር ቶላይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403908, 4039, N'Cህኤንአ', N'Cህኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403909, 4039, N'Cህኤትአ', N'Cህኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403911, 4039, N'Dኤድኦ', N'Dኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403913, 4039, N'Dኦብአ', N'Dኦብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403915, 4039, N'ጋላና', N'ጋላና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403917, 4039, N'Gኦምምአ', N'Gኦምምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403919, 4039, N'Gኡምአይ', N'Gኡምአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403944, 4039, N'Hአብርኦ', N'Hአብርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403945, 4039, N'Kኤርስአ', N'Kኤርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403947, 4039, N'Lአኤልአይ Mአይክህኤው', N'Lአኤልአይ Mአይክህኤው')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403998, 4039, N'Lኢምኡ Sኤክአ', N'Lኢምኡ Sኤክአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403926, 4039, N'Mአንአ', N'Mአንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403928, 4039, N'ኔንሴቦ', N'ኔንሴቦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403920, 4039, N'Oምኦ Bኤይአም', N'Oምኦ Bኤይአም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403922, 4039, N'Sኤክአ Cህኤክኦርስአ', N'Sኤክአ Cህኤክኦርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403924, 4039, N'Sህኤብኤ Sኦንብኦ', N'Sህኤብኤ Sኦንብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403989, 4039, N'Sኦክኦርኡ', N'Sኦክኦርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403988, 4039, N'Tኢርኦአፍኤትአ', N'Tኢርኦአፍኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404205, 4042, N'Aንፍኢልኦ', N'Aንፍኢልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404207, 4042, N'Dአልልኤ Sአድኢ', N'Dአልልኤ Sአድኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404208, 4042, N'Dአልልኤውአብአርአ', N'Dአልልኤውአብአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404210, 4042, N'Gአውኦ Kኤብኤ', N'Gአውኦ Kኤብኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404211, 4042, N'Gኢድአምኢ', N'Gኢድአምኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404213, 4042, N'ሃዋጋላን', N'ሃዋጋላን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404215, 4042, N'ላሎቂሌ', N'ላሎቂሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404216, 4042, N'Sኤይኦ', N'Sኤይኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404509, 4045, N'Aግአርፍአ', N'Aግአርፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404511, 4045, N'Bኤርብኤርኤ', N'Bኤርብኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404513, 4045, N'Dኢንስህኦ', N'Dኢንስህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404514, 4045, N'Gአስኤርአ', N'Gአስኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404517, 4045, N'Gኦርኦ', N'Gኦርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404518, 4045, N'Gኡርአ Dአምኦልኤ', N'Gኡርአ Dአምኦልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404520, 4045, N'Sኢንአንአ', N'Sኢንአንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404722, 4047, N'Aድአብአ', N'Aድአብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404724, 4047, N'Aርብኤግኦንአ', N'Aርብኤግኦንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404725, 4047, N'Aርስኢ Nኤግኤልኤ', N'Aርስኢ Nኤግኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404727, 4047, N'Bኢልአትኤ Zኡርኢይአ', N'Bኢልአትኤ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404729, 4047, N'Dኦድኦልአ', N'Dኦድኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404731, 4047, N'Gአድኤብ Aስኤስአ', N'Gአድኤብ Aስኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404732, 4047, N'ጎርቼ', N'ጎርቼ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404734, 4047, N'Hኤብኤን Aርስኢ', N'Hኤብኤን Aርስኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404735, 4047, N'Kኦፍአልኤ', N'Kኦፍአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404737, 4047, N'Kኦርኤ', N'Kኦርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404739, 4047, N'Sህአልአ', N'Sህአልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404741, 4047, N'Sኢርአርኦ', N'Sኢርአርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404742, 4047, N'Wኤንድኦ', N'Wኤንድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404803, 4048, N'አባያ', N'አባያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404804, 4048, N'አንካር', N'አንካር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404805, 4048, N'ቢርቢርሳ ኮጆዋ', N'ቢርቢርሳ ኮጆዋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404806, 4048, N'ቡሌ ሆራ', N'ቡሌ ሆራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404807, 4048, N'ዱግዳ ዳዋ', N'ዱግዳ ዳዋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404808, 4048, N'ጋላና', N'ጋላና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404809, 4048, N'ሀምቤላ ዋሜና', N'ሀምቤላ ዋሜና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404810, 4048, N'ኬርቻ', N'ኬርቻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404811, 4048, N'ማልካ ሶዳ', N'ማልካ ሶዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404812, 4048, N'ሶሮ ባርጉዳ', N'ሶሮ ባርጉዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404953, 4049, N'Aብኡንአ Gኢንድኤብኤርኤት', N'Aብኡንአ Gኢንድኤብኤርኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404955, 4049, N'Aድአምኢትኡልኡ', N'Aድአምኢትኡልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404956, 4049, N'አንካር', N'አንካር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404957, 4049, N'Bኤድኤስአ Kኤትኤምአ Aስኤትኤድአድኤር', N'Bኤድኤስአ Kኤትኤምአ Aስኤትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404958, 4049, N'Bኦክኤ', N'Bኦክኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404959, 4049, N'ቦናያቦሸ', N'ቦናያቦሸ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404960, 4049, N'Bኡርአ', N'Bኡርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404961, 4049, N'Bኡርክአ Dህኢንትኡ', N'Bኡርክአ Dህኢንትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404962, 4049, N'ቺናክሰን', N'ቺናክሰን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404963, 4049, N'Cህኢርኦ', N'Cህኢርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404964, 4049, N'Dአርአርአ', N'Dአርአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404965, 4049, N'Dአርኦ Lአብኡ', N'Dአርኦ Lአብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404966, 4049, N'Dኤድኤር', N'Dኤድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404993, 4049, N'Dኦብአ', N'Dኦብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404967, 4049, N'Gኤምኤክህኢስ', N'Gኤምኤክህኢስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404968, 4049, N'Gኦርኦ Mኡትኢ', N'Gኦርኦ Mኡትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404969, 4049, N'ጉባ ኮሪቻ', N'ጉባ ኮሪቻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404970, 4049, N'Gኡምብኢ Bኦርድኤድኤ', N'Gኡምብኢ Bኦርድኤድኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404971, 4049, N'Hአብርኦ', N'Hአብርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404972, 4049, N'Hአውኢ Gኡድኢንአ', N'Hአውኢ Gኡድኢንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404973, 4049, N'ጃርሶ', N'ጃርሶ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404974, 4049, N'Kኤርስአ', N'Kኤርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404975, 4049, N'Mኤስኤልአ', N'Mኤስኤልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404976, 4049, N'Mኢኤስኦ', N'Mኢኤስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404977, 4049, N'Oድአ Bኡልትኡም', N'Oድአ Bኡልትኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404978, 4049, N'Sኤይኦ Nኦልኤ', N'Sኤይኦ Nኦልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404979, 4049, N'Tኡልኦ', N'Tኡልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405050, 4050, N'Aብኡንአ Gኢንድኤብኤርኤት', N'Aብኡንአ Gኢንድኤብኤርኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405051, 4050, N'Aድኤአ Bኤርግአ', N'Aድኤአ Bኤርግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405052, 4050, N'አምቦ ዙሪያይ', N'አምቦ ዙሪያይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405053, 4050, N'ባቢሌ', N'ባቢሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405054, 4050, N'Bአክኦ Tኢብኤ', N'Bአክኦ Tኢብኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405055, 4050, N'Cህኤብኤ Gአምብኤልትኡ', N'Cህኤብኤ Gአምብኤልትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405056, 4050, N'Cህኤልኢይአ', N'Cህኤልኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405057, 4050, N'Cኦብኢ', N'Cኦብኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405058, 4050, N'Dአንኦ', N'Dአንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405059, 4050, N'Dኤንድኢ', N'Dኤንድኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405040, 4050, N'Dኢርኤ Iንክህኢንኢ', N'Dኢርኤ Iንክህኢንኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405041, 4050, N'Eጅኤርኤ', N'Eጅኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405042, 4050, N'Eጅኤርስአ Lአፍኦ', N'Eጅኤርስአ Lአፍኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405043, 4050, N'Eልፍኤትአ', N'Eልፍኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405044, 4050, N'Gኢንድኤብኤርኤት', N'Gኢንድኤብኤርኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405045, 4050, N'Gኢርአውአ', N'Gኢርአውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405046, 4050, N'Iልኡ Gአልአን', N'Iልኡ Gአልአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405047, 4050, N'Jአውኢ Lኢብአን', N'Jአውኢ Lኢብአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405048, 4050, N'Jኤልድኡ', N'Jኤልድኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405049, 4050, N'Jኢብአት', N'Jኢብአት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405030, 4050, N'Mኤድአክኤግን', N'Mኤድአክኤግን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405031, 4050, N'Mኤትአ Rኦብኢ', N'Mኤትአ Rኦብኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405032, 4050, N'Mኤትአ Wአልክኢትኤ', N'Mኤትአ Wአልክኢትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405033, 4050, N'Nኦንኦ', N'Nኦንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405034, 4050, N'Tኦክኤ Kኡትአይኤ', N'Tኦክኤ Kኡትአይኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405155, 4051, N'Aይኢርአ', N'Aይኢርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405156, 4051, N'ባቢሌ', N'ባቢሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405157, 4051, N'Bአብኦ Gአምብኤል', N'Bአብኦ Gአምብኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405158, 4051, N'Bኤግኢ', N'Bኤግኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405159, 4051, N'Bኦጅኢ Cህኦክኦርስአ', N'Bኦጅኢ Cህኦክኦርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405160, 4051, N'Bኦጅኢ Dኢምአጅኢ', N'Bኦጅኢ Dኢምአጅኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405161, 4051, N'Gአንጅኢ', N'Gአንጅኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405162, 4051, N'Gኢምብኢ', N'Gኢምብኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405164, 4051, N'Gኡልኢስኦ', N'Gኡልኢስኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405166, 4051, N'Hኦምአ', N'Hኦምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405168, 4051, N'Kኢልትኡ Kአርአ', N'Kኢልትኡ Kአርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405170, 4051, N'Lአልኦ Aስአብኢ', N'Lአልኦ Aስአብኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405172, 4051, N'Mአንአ Sኢብኡ', N'Mአንአ Sኢብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405174, 4051, N'Nኤጅኦ', N'Nኤጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405175, 4051, N'Nኤጅኦ Tኦውን', N'Nኤጅኦ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405186, 4051, N'Sኤይኦ Nኦልኤ', N'Sኤይኦ Nኦልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405380, 4053, N'ዳዌ ሰረር', N'ዳዌ ሰረር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405381, 4053, N'ደብሬ ሊባኖስ', N'ደብሬ ሊባኖስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405383, 4053, N'Gኢንኢር', N'Gኢንኢር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405385, 4053, N'Gኦልኦልክህአ', N'Gኦልኦልክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405386, 4053, N'Lኤግአህኢድአ', N'Lኤግአህኢድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405388, 4053, N'Sኤውኤይንአ', N'Sኤውኤይንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405491, 4054, N'ባቢሌ', N'ባቢሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405492, 4054, N'Bኤድኤንኦ', N'Bኤድኤንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405495, 4054, N'Dኤድኤር', N'Dኤድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405497, 4054, N'Fኤድኢስ', N'Fኤድኢስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405499, 4054, N'ፈንታሌ', N'ፈንታሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405410, 4054, N'Gኢርአውአ', N'Gኢርአውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405412, 4054, N'Gኦርኦ Mኡትኢ', N'Gኦርኦ Mኡትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405414, 4054, N'Gኡርስኡም', N'Gኡርስኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405416, 4054, N'Hአርኤምአይአ Kኤትኤምአ', N'Hአርኤምአይአ Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405418, 4054, N'Kኤርስአ', N'Kኤርስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405420, 4054, N'ኩምቢ', N'ኩምቢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405421, 4054, N'Kኡርፍአ Cህኤልኤ', N'Kኡርፍአ Cህኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405423, 4054, N'Mኤትአ', N'Mኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405425, 4054, N'Mኢድአግአ Tኦልአ', N'Mኢድአግአ Tኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405546, 4055, N'Aድአምአ', N'Aድአምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405548, 4055, N'Aድኤአ', N'Aድኤአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405510, 4055, N'Bኦርአ', N'Bኦርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405512, 4055, N'Dኡግድአ', N'Dኡግድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405524, 4055, N'Gኢምብኢክህኡ', N'Gኢምብኢክህኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405516, 4055, N'Lኡምኤ', N'Lኡምኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405617, 4056, N'Aንግኤር Gኡትኤ Tኦውን', N'Aንግኤር Gኡትኤ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405619, 4056, N'ዲጋ', N'ዲጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405621, 4056, N'Gኢድአ Aይአንአ', N'Gኢድአ Aይአንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405624, 4056, N'ጉቶጊዳ', N'ጉቶጊዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405626, 4056, N'Jኢምአ Aርጅኦ', N'Jኢምአ Aርጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405628, 4056, N'Lኤክአ Dኡልኤክህአ', N'Lኤክአ Dኡልኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405630, 4056, N'Nኡንኡ Kኡምብአ', N'Nኡንኡ Kኡምብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405632, 4056, N'Sኢብኡ Sኢርኤ', N'Sኢብኡ Sኢርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405634, 4056, N'Wአይኡ Tኡቅአ', N'Wአይኡ Tኡቅአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405705, 4057, N'Mኦድጅኦ', N'Mኦድጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405807, 4058, N'Bኤርአክ', N'Bኤርአክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405809, 4058, N'Sአብአትአ Hአውአስ', N'Sአብአትአ Hአውአስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405811, 4058, N'Sኡልኡልትአ', N'Sኡልኡልትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405913, 4059, N'Rኦብኤ Kኤትኤምአ Aስትኤድአድኤር', N'Rኦብኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406115, 4061, N'አቢቹ እና ግኒ ወረዳ', N'አቢቹ እና ግኒ ወረዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406111, 4061, N'Dአግአም', N'Dአግአም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406117, 4061, N'Dአርርአ', N'Dአርርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406119, 4061, N'Fኢክህኤ', N'Fኢክህኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406121, 4061, N'Hኢድኤብኡ Aብኦትኤ', N'Hኢድኤብኡ Aብኦትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406122, 4061, N'Jኢድአ', N'Jኢድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406124, 4061, N'Kኡይኡ', N'Kኡይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406126, 4061, N'Wኡክህአልኤ', N'Wኡክህአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406228, 4062, N'Sህአስህአምአንኤ Kኤትኤምአ Aስትኤድአድኤር', N'Sህአስህአምአንኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406329, 4063, N'Sኡልኡልትአ', N'Sኡልኡልትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400102, 4001, N'Dአውኦ', N'Dአውኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400104, 4001, N'ወሊሶ', N'ወሊሶ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400389, 4003, N'አልጌ ሳቺ', N'አልጌ ሳቺ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400304, 4003, N'መቱ ከተማ', N'መቱ ከተማ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400811, 4008, N'Bአልኤ', N'Bአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400876, 4008, N'ቦኩ', N'ቦኩ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400814, 4008, N'Dኢብኤ', N'Dኢብኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400801, 4008, N'Lኦግኦ', N'Lኦግኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401001, 4010, N'Aምብኦ', N'Aምብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401101, 4011, N'Aድኢይኦ', N'Aድኢይኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401103, 4011, N'Aምኢግንአ', N'Aምኢግንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401105, 4011, N'Bኤድኤንኦ', N'Bኤድኤንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401107, 4011, N'Bኤልኤ Gኤስኢግአር', N'Bኤልኤ Gኤስኢግአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401108, 4011, N'Bኦክኤ', N'Bኦክኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401110, 4011, N'Dኤብኡብ Sኦድኦ', N'Dኤብኡብ Sኦድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401112, 4011, N'Dኢክስኢስ', N'Dኢክስኢስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401113, 4011, N'Dኦድኦትአ', N'Dኦድኦትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401115, 4011, N'Gኦርኦ Dኦልአ', N'Gኦርኦ Dኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401117, 4011, N'Hኢትኦስአ', N'Hኢትኦስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401119, 4011, N'Jኤጅኡ', N'Jኤጅኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401120, 4011, N'Jኢምአ Aርጅኦ', N'Jኢምአ Aርጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401122, 4011, N'Lኦድኤህኢትኦስአ', N'Lኦድኤህኢትኦስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401124, 4011, N'Mኡንኤስአ', N'Mኡንኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401126, 4011, N'Sኤርኡ', N'Sኤርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401128, 4011, N'Sህኢርክአ', N'Sህኢርክአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401129, 4011, N'Sኢርኤ', N'Sኢርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401131, 4011, N'Tኤንአ', N'Tኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401133, 4011, N'Zኤውአይድኡግድአ', N'Zኤውአይድኡግድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (407031, 4070, N'Bአትኡ_ክኢትይ Aድምንስትርአትኢኦን', N'Bአትኡ_ክኢትይ Aድምንስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401638, 4016, N'አባያ', N'አባያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401639, 4016, N'Aብኡንአ Gኢንድኤብኤርኤት', N'Aብኡንአ Gኢንድኤብኤርኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401698, 4016, N'Aርኤርኦ', N'Aርኤርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401642, 4016, N'Dአምብኢ Dኦልልኦ Tኦውን', N'Dአምብኢ Dኦልልኦ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401643, 4016, N'Dህአስኢ', N'Dህአስኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401645, 4016, N'Dኢርኤ', N'Dኢርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401647, 4016, N'Eል Wአይኤ', N'Eል Wአይኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401649, 4016, N'Gኦርኦ Dኦልአ', N'Gኦርኦ Dኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401651, 4016, N'Gኡክህኢ', N'Gኡክህኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401652, 4016, N'Gኡርስኡም', N'Gኡርስኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401654, 4016, N'Mኢስርአክ', N'Mኢስርአክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401657, 4016, N'Tኤልትኤልኤ', N'Tኤልትኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401658, 4016, N'Wአክህኢልኤ', N'Wአክህኢልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401660, 4016, N'Yአብኤልኦ Tውኦን', N'Yአብኤልኦ Tውኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401762, 4017, N'Aድአምኢትኡልኡ', N'Aድአምኢትኡልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401763, 4017, N'Bኤድኤልኤ Zኡርኢይአ', N'Bኤድኤልኤ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401765, 4017, N'Bኦርኤክህአ', N'Bኦርኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401767, 4017, N'Cህአንክአ Wኦርኤድአ', N'Cህአንክአ Wኦርኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401711, 4017, N'Dኤድኦ', N'Dኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401772, 4017, N'Dኢድኤስስአ', N'Dኢድኤስስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401774, 4017, N'Mአክክኦ', N'Mአክክኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140902, 1409, N'Wኤርኤድአ 01', N'Wኤርኤድአ 01')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140903, 1409, N'ወረዳ 02', N'ወረዳ 02')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140904, 1409, N'Wኤርኤድአ 03', N'Wኤርኤድአ 03')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140905, 1409, N'Wኤርኤድአ 04', N'Wኤርኤድአ 04')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140906, 1409, N'Wኤርኤድአ 05', N'Wኤርኤድአ 05')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140907, 1409, N'Wኤርኤድአ 06', N'Wኤርኤድአ 06')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140908, 1409, N'Wኤርኤድአ 07', N'Wኤርኤድአ 07')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140909, 1409, N'Wኤርኤድአ 08', N'Wኤርኤድአ 08')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140910, 1409, N'Wኤርኤድአ 09', N'Wኤርኤድአ 09')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140911, 1409, N'Wኤርኤድአ 10', N'Wኤርኤድአ 10')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140912, 1409, N'Wኤርኤድአ 12', N'Wኤርኤድአ 12')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140703, 1407, N'Wኤርኤድአ 03', N'Wኤርኤድአ 03')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140704, 1407, N'Wኤርኤድአ 04', N'Wኤርኤድአ 04')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140705, 1407, N'Wኤርኤድአ 05', N'Wኤርኤድአ 05')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140706, 1407, N'Wኤርኤድአ 06', N'Wኤርኤድአ 06')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140707, 1407, N'Wኤርኤድአ 07', N'Wኤርኤድአ 07')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140708, 1407, N'Wኤርኤድአ 08', N'Wኤርኤድአ 08')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140709, 1407, N'Wኤርኤድአ 09', N'Wኤርኤድአ 09')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140710, 1407, N'Wኤርኤድአ 10', N'Wኤርኤድአ 10')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140711, 1407, N'Wኤርኤድአ 11', N'Wኤርኤድአ 11')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140712, 1407, N'Wኤርኤድአ 12', N'Wኤርኤድአ 12')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141104, 1411, N'Wኤርኤድአ 2', N'Wኤርኤድአ 2')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141105, 1411, N'Wኤርኤድአ 3', N'Wኤርኤድአ 3')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141106, 1411, N'Wኤርኤድአ 4', N'Wኤርኤድአ 4')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141107, 1411, N'Wኤርኤድአ 5', N'Wኤርኤድአ 5')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141108, 1411, N'Wኤርኤድአ 6', N'Wኤርኤድአ 6')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141109, 1411, N'Wኤርኤድአ 7', N'Wኤርኤድአ 7')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141110, 1411, N'Wኤርኤድአ 8', N'Wኤርኤድአ 8')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141111, 1411, N'Wኤርኤድአ 9', N'Wኤርኤድአ 9')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141112, 1411, N'Wኤርኤድአ 10', N'Wኤርኤድአ 10')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141113, 1411, N'Wኤርኤድአ 11', N'Wኤርኤድአ 11')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140103, 1401, N'Wኤርኤድአ 01', N'Wኤርኤድአ 01')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140104, 1401, N'ወረዳ 02', N'ወረዳ 02')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140105, 1401, N'Wኤርኤድአ 03', N'Wኤርኤድአ 03')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140111, 1401, N'Wኤርኤድአ 06', N'Wኤርኤድአ 06')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140112, 1401, N'Wኤርኤድአ 10', N'Wኤርኤድአ 10')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140113, 1401, N'Wኤርኤድአ 11', N'Wኤርኤድአ 11')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140114, 1401, N'Wኤርኤድአ 12', N'Wኤርኤድአ 12')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140115, 1401, N'Wኤርኤድአ 13', N'Wኤርኤድአ 13')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140116, 1401, N'Wኤርኤድአ 14', N'Wኤርኤድአ 14')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140117, 1401, N'Wኤርኤድአ 15', N'Wኤርኤድአ 15')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140118, 1401, N'Wኤርኤድአ 16', N'Wኤርኤድአ 16')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140119, 1401, N'Wኤርኤድአ 17', N'Wኤርኤድአ 17')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140120, 1401, N'Wኤርኤድአ 18', N'Wኤርኤድአ 18')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140121, 1401, N'Wኤርኤድአ 19', N'Wኤርኤድአ 19')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140122, 1401, N'Wኤርኤድአ 20', N'Wኤርኤድአ 20')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140124, 1401, N'Wኤርኤድአ 22', N'Wኤርኤድአ 22')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140125, 1401, N'Wኤርኤድአ 23', N'Wኤርኤድአ 23')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140127, 1401, N'Wኤርኤድአ 25', N'Wኤርኤድአ 25')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140129, 1401, N'Wኤርኤድአ 27', N'Wኤርኤድአ 27')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140131, 1401, N'Wኤርኤድአ 29', N'Wኤርኤድአ 29')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303751, 3037, N'Dኡርኤ Bኤትኤ', N'Dኡርኤ Bኤትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304733, 3047, N'Aርምአጅኦ', N'Aርምአጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720101, 7201, N'Mኢስርአክ Mኤስክአን', N'Mኢስርአክ Mኤስክአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720102, 7201, N'Mኤስክአን', N'Mኤስክአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720103, 7201, N'Sኦድኦ', N'Sኦድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720104, 7201, N'Dኤብኡብ Sኦድኦ', N'Dኤብኡብ Sኦድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400305, 4003, N'ቤቶ', N'ቤቶ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (720401, 7204, N'Aትኦትኤ', N'Aትኦትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400310, 4003, N'ቡሬ', N'ቡሬ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400320, 4003, N'ኖኖ ሴሌ', N'ኖኖ ሴሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400323, 4003, N'ዲዱ', N'ዲዱ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400351, 4003, N'አሌ', N'አሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400352, 4003, N'ባቾ', N'ባቾ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400353, 4003, N'ዶራኒ', N'ዶራኒ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400354, 4003, N'ሃሉ', N'ሃሉ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (400355, 4003, N'ሁሩሙ', N'ሁሩሙ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251552, 2515, N'Aፍአምብኦ', N'Aፍአምብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251554, 2515, N'Aይስአይኢትአ', N'Aይስአይኢትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251502, 2515, N'Dኡብትኢ Kኤትኤምአ Aስትኤድአድኤር', N'Dኡብትኢ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251505, 2515, N'Gኤይርኤንኢ', N'Gኤይርኤንኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251507, 2515, N'Mኢልኤ', N'Mኢልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251602, 2516, N'Aፍድኤርአ', N'Aፍድኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251689, 2516, N'Bኤርኤህአልኤ', N'Bኤርኤህአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251604, 2516, N'Dአልኦል', N'Dአልኦል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251606, 2516, N'Kኡንኤብአ', N'Kኡንኤብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251709, 2517, N'አርጎባ ሊዩ', N'አርጎባ ሊዩ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251711, 2517, N'Dኡልኤስአ', N'Dኡልኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251713, 2517, N'Gኤውአንኤ', N'Gኤውአንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251815, 2518, N'Eውአ', N'Eውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251817, 2518, N'Tኤርኡ', N'Tኤርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251919, 2519, N'Dአልኢፍአግኤ', N'Dአልኢፍአግኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (251921, 2519, N'Hadele'ela', N'Hadele'ela')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (252001, 2520, N'Lኦግኢአ Sኤምኤርአ', N'Lኦግኢአ Sኤምኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140102, 1401, N'Mኤንዝ Mአምአ Mኢድኢር', N'Mኤንዝ Mአምአ Mኢድኢር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140108, 1401, N'Wኤርኤድአ 07', N'Wኤርኤድአ 07')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140110, 1401, N'Wኤርኤድአ 09', N'Wኤርኤድአ 09')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140203, 1402, N'Mኤንዝ Gኤርአ Mኢድኤርኤ', N'Mኤንዝ Gኤርአ Mኢድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140302, 1403, N'Wኤርኤድአ 09', N'Wኤርኤድአ 09')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140504, 1405, N'Mኤንዝ Gኤርአ Mኢድኤርኤ', N'Mኤንዝ Gኤርአ Mኢድኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140602, 1406, N'Wኤርኤድአ 04', N'Wኤርኤድአ 04')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (140701, 1407, N'Wኤርኤድአ 01', N'Wኤርኤድአ 01')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141002, 1410, N'Wኤርኤድአ 1', N'Wኤርኤድአ 1')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (141204, 1412, N'Wኤርኤድአ 1', N'Wኤርኤድአ 1')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700102, 7001, N'Dኢዝኡ-Gኤድኢ', N'Dኢዝኡ-Gኤድኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700104, 7001, N'Gኡርአፍኤርድአ', N'Gኡርአፍኤርድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700107, 7001, N'Sህአይ Bኤንክህ', N'Sህአይ Bኤንክህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700209, 7002, N'Bኢትአ', N'Bኢትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700211, 7002, N'Eስኤርአ', N'Eስኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700213, 7002, N'Gኤንአ Bኦስአ', N'Gኤንአ Bኦስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700215, 7002, N'Kኤክህኢ', N'Kኤክህኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700217, 7002, N'Mአርአክአ', N'Mአርአክአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700220, 7002, N'Tአርክህአ Zኡርኢይአ', N'Tአርክህአ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700322, 7003, N'Gአክህኢት', N'Gአክህኢት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700424, 7004, N'Bኢትአ', N'Bኢትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700426, 7004, N'Cህኤንአ', N'Cህኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700428, 7004, N'ደቻ', N'ደቻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700430, 7004, N'Gኤውአትአ', N'Gኤውአትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700432, 7004, N'Gኦብአ', N'Gኦብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700434, 7004, N'Sህኤስህኦኤንድኤይ', N'Sህኤስህኦኤንድኤይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700537, 7005, N'Eልአ Hአንክህአንኦ', N'Eልአ Hአንክህአንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700601, 7006, N'ቤሮ', N'ቤሮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700603, 7006, N'Gኦርኢ Gኤስህአ', N'Gኦርኢ Gኤስህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700605, 7006, N'Mኤንኢት Sህአስህአ', N'Mኤንኢት Sህአስህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700701, 7007, N'Aንድርአክህአ', N'Aንድርአክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (700703, 7007, N'Yኤክኢ', N'Yኤክኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710102, 7101, N'Mአርኢ Mአንስአ', N'Mአርኢ Mአንስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710302, 7103, N'ኤኖሞር ኤና ኤነር', N'ኤኖሞር ኤና ኤነር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710502, 7105, N'Bአህኤል Aድአርአስህ', N'Bአህኤል Aድአርአስህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710505, 7105, N'Hአውኤልአ Tኡልአ', N'Hአውኤልአ Tኡልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710508, 7105, N'Mኢስርአክ', N'Mኢስርአክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710610, 7106, N'Lኦክኦ Aብአይአ', N'Lኦክኦ Aብአይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710712, 7107, N'አሌታ ቹኮ', N'አሌታ ቹኮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710715, 7107, N'Bኢልአትኤ Zኡርኢይአ', N'Bኢልአትኤ Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710717, 7107, N'Cህኢርኦንኤ', N'Cህኢርኦንኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710720, 7107, N'Dአርአ Oትኢልክህኦ', N'Dአርአ Oትኢልክህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710722, 7107, N'Tኤትኢክህአ', N'Tኤትኢክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710802, 7108, N'Dአልኤ', N'Dአልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710804, 7108, N'Lኦክኦ Aብአይአ', N'Lኦክኦ Aብአይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710807, 7108, N'Wኦንስህኦ', N'Wኦንስህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710901, 7109, N'Aርኦርኤስአ', N'Aርኦርኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710911, 7109, N'Bኦንአ Zኡርኢአ', N'Bኦንአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (710913, 7109, N'Cህኤብኤ Gአምብኤልትኡ', N'Cህኤብኤ Gአምብኤልትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500101, 5001, N'አንካር', N'አንካር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500103, 5001, N'Bአርኤ', N'Bአርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500105, 5001, N'Cህኤርኤትኢ', N'Cህኤርኤትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500108, 5001, N'Eልክኤርኤ', N'Eልክኤርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500109, 5001, N'Gኦድግኦድ', N'Gኦድግኦድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500111, 5001, N'Kአርስስአ Dኡልአ', N'Kአርስስአ Dኡልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500113, 5001, N'Mኢርአብ Eምኢይ', N'Mኢርአብ Eምኢይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500402, 5004, N'Gኡክህኢ', N'Gኡክህኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500404, 5004, N'ሞያሌ', N'ሞያሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500502, 5005, N'Dአርኦ Lአብኡ', N'Dአርኦ Lአብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500504, 5005, N'Hኡድኤት', N'Hኡድኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500506, 5005, N'ሞያሌ', N'ሞያሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500508, 5006, N'Dአንኦት', N'Dአንኦት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500801, 5008, N'Bኤኤርአንኦ', N'Bኤኤርአንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500803, 5008, N'Dአንኦት', N'Dአንኦት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (500805, 5008, N'Gአልልአድኢ', N'Gአልልአድኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501401, 5014, N'Aህኢፍኤርኦም', N'Aህኢፍኤርኦም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501403, 5014, N'Bኦክኦልምአይኡ', N'Bኦክኦልምአይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501406, 5014, N'Fኢልትኡ', N'Fኢልትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501408, 5014, N'Gኡርአ Dአምኦልኤ', N'Gኡርአ Dአምኦልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501501, 5015, N'ጉባ ኮሪቻ', N'ጉባ ኮሪቻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501702, 5017, N'Dኡህኡን', N'Dኡህኡን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501704, 5017, N'Gኤርብኦ', N'Gኤርብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501706, 5017, N'Hአርኦስህኤግአህ', N'Hአርኦስህኤግአህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501808, 5018, N'Aብአቅኤርኦ', N'Aብአቅኤርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501810, 5018, N'Bኤኤርአንኦ', N'Bኤኤርአንኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501813, 5018, N'Eአስት Eምኤ', N'Eአስት Eምኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501815, 5018, N'Fኤርፍኤር', N'Fኤርፍኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501817, 5018, N'Kኤልአፍኦ', N'Kኤልአፍኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501901, 5019, N'Aፍድኤም', N'Aፍድኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501903, 5019, N'Dኤምብኤል', N'Dኤምብኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501905, 5019, N'Gኤብልአልኡ', N'Gኤብልአልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501906, 5019, N'ሀዲጋላ', N'ሀዲጋላ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (501909, 5019, N'Sህኢንኢልኤ', N'Sህኢንኢልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303494, 3034, N'Mኢስርአክብኤልኤስአ', N'Mኢስርአክብኤልኤስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303499, 3034, N'Wኦግኤርአ', N'Wኦግኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303704, 3037, N'Bአህኢርድአር Zኡርኢይአ', N'Bአህኢርድአር Zኡርኢይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303707, 3037, N'Dኤብኡብ Aክህኤፍኤር', N'Dኤብኡብ Aክህኤፍኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303710, 3037, N'Dኤምብኤክህአ', N'Dኤምብኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303712, 3037, N'Fኢንኦትኤስኤልአም Kኤትኤምአ Aስትኤድአድኤር', N'Fኢንኦትኤስኤልአም Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303716, 3037, N'Mኤርአውኢ Kኤትኤምአ Aስትኤድአድኤር', N'Mኤርአውኢ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303719, 3037, N'Sኤክኤልአ', N'Sኤክኤልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303721, 3037, N'Sኤምኤን Mኤክህአ', N'Sኤምኤን Mኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303724, 3037, N'Yኢልምአንአ Dኤንስአ', N'Yኢልምአንአ Dኤንስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303827, 3038, N'Mኤርአብ Aርምአክህኢህኦ', N'Mኤርአብ Aርምአክህኢህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (303829, 3038, N'Mኢድርኤ Gኤንኤት Kኤትኤምአ Aስትኤድአድኤር', N'Mኢድርኤ Gኤንኤት Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304307, 3043, N'Aንኤድኤድ', N'Aንኤድኤድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304337, 3043, N'Aውአብኤል', N'Aውአብኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304339, 3043, N'Bኤይኤድአ', N'Bኤይኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304341, 3043, N'Dኤብአይ Tኢልአት Gኢን', N'Dኤብአይ Tኢልአት Gኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304344, 3043, N'Dኤብርኤ Mአርክኦስ', N'Dኤብርኤ Mአርክኦስ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304347, 3043, N'Eንኤብስኢኤ Sአር Mኢድኢር', N'Eንኤብስኢኤ Sአር Mኢድኢር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304384, 3043, N'Gኦንክህአ Sኢስኦ Eንኤስኤ', N'Gኦንክህአ Sኢስኦ Eንኤስኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304386, 3043, N'Hኡልኤት Eጅኡ Eንኤስኤ', N'Hኡልኤት Eጅኡ Eንኤስኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304388, 3043, N'Mኦትአ Kኤትኤምአ Aስትኤድአድኤር', N'Mኦትአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304351, 3043, N'Bአስስኦ Eንአ Wኤርኤንአ', N'Bአስስኦ Eንአ Wኤርኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304514, 3045, N'አሌታ ቹኮ', N'አሌታ ቹኮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304516, 3045, N'Bአትኢ', N'Bአትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304518, 3045, N'ዴዋ ቼፋ', N'ዴዋ ቼፋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304521, 3045, N'Jኢልኤ Tኢምኡግአ', N'Jኢልኤ Tኢምኡግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304725, 3047, N'Bኤይኤድአ', N'Bኤይኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304727, 3047, N'Dአብአት', N'Dአብአት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304729, 3047, N'Dኤብአርክ Cኢትይ Aድምኢንኢስትርአትኢኦን', N'Dኤብአርክ Cኢትይ Aድምኢንኢስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304915, 3049, N'አሌታ ቹኮ', N'አሌታ ቹኮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304918, 3049, N'Aንትስኦክኢአ Gኤምዝአ', N'Aንትስኦክኢአ Gኤምዝአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304920, 3049, N'Aስአግርት', N'Aስአግርት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304922, 3049, N'Bኤርኤህኤት', N'Bኤርኤህኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304925, 3049, N'Eኤንኤውአርኢ Tኦውን Aድምኢንስትርአትኢኦን', N'Eኤንኤውአርኢ Tኦውን Aድምኢንስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304928, 3049, N'Gኤስህኤ', N'Gኤስህኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304951, 3049, N'Kኤውኦት', N'Kኤውኦት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304931, 3049, N'Mኤንዝ Kኤይአ Gኤብርአኤል', N'Mኤንዝ Kኤይአ Gኤብርአኤል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304934, 3049, N'Mኢድአ Wኦርኤምኦ', N'Mኢድአ Wኦርኤምኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304937, 3049, N'Mኦጅአንአ Wኤድኤርአ', N'Mኦጅአንአ Wኤድኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (304940, 3049, N'Sአይአ Dኤብኢርንአ Wአይኡ', N'Sአይአ Dኤብኢርንአ Wአይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305011, 3050, N'Aንግኦት', N'Aንግኦት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305014, 3050, N'Dአውኡንት', N'Dአውኡንት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305016, 3050, N'Gኢድአን', N'Gኢድአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305018, 3050, N'Hአብኢርኡ', N'Hአብኢርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305020, 3050, N'Lአልኢብኤልአ Kኤትኤምአ Aስትኤድአድኤር', N'Lአልኢብኤልአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100803, 1008, N'Aትስብኢ Wኤንብኤርትአ', N'Aትስብኢ Wኤንብኤርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100203, 1002, N'Hአድንኤት', N'Hአድንኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100808, 1008, N'Sኤህአርትኢ Sአምርኤ', N'Sኤህአርትኢ Sአምርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100201, 1002, N'Aድውአ Tኦውን', N'Aድውአ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100209, 1002, N'Aክስኡም', N'Aክስኡም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100211, 1002, N'Kኦርኤም', N'Kኦርኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100213, 1002, N'Oፍልአ', N'Oፍልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100315, 1003, N'Aድኢህአክኢ', N'Aድኢህአክኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100317, 1003, N'Aድውአ Tኦውን', N'Aድውአ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100319, 1003, N'Aስኤግኤድኤ Tስኢምብኢልአ', N'Aስኤግኤድኤ Tስኢምብኢልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100322, 1003, N'Kኢልትኤ Aውልአልኦ', N'Kኢልትኤ Aውልአልኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100325, 1003, N'Mኤርኤብ Lኤክኤ', N'Mኤርኤብ Lኤክኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100327, 1003, N'Tአህትአይ Aድኢይአብኦ', N'Tአህትአይ Aድኢይአብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100330, 1003, N'Wኤርኤ Lኤህኤ', N'Wኤርኤ Lኤህኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100432, 1004, N'Aስኤግኤድኤ Tስኢምብኢልአ', N'Aስኤግኤድኤ Tስኢምብኢልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100434, 1004, N'Hአውኤልትኢ', N'Hአውኤልትኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100436, 1004, N'Qኡኢህአ', N'Qኡኢህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (100538, 1005, N'Kአፍትአ Hኡምኤርአ', N'Kአፍትአ Hኡምኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221118, 2211, N'Mኢርአብ Aብአይአ', N'Mኢርአብ Aብአይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221121, 2211, N'Qኡክህአ', N'Qኡክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221124, 2211, N'Sኤልአም Bኤር Kኤትኤምአ Aስኤትኤድአድኤር', N'Sኤልአም Bኤር Kኤትኤምአ Aስኤትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221228, 2212, N'Kኦክህኦርኤ', N'Kኦክህኦርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221230, 2212, N'Yኢርግአ Cህኤፍኤ', N'Yኢርግአ Cህኤፍኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221332, 2213, N'Bኡልክኢ Kኤትኤምአ Aስኤትኤድአድኤር', N'Bኡልክኢ Kኤትኤምአ Aስኤትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221336, 2213, N'Kኦንትአ Lኢይኡ', N'Kኦንትአ Lኢይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221331, 2213, N'Mኤልኦ Gአድአ', N'Mኤልኦ Gአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221340, 2213, N'Sአውኡልአ', N'Sአውኡልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221342, 2213, N'Zአልአ', N'Zአልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221441, 2214, N'Aንግኤክህአ', N'Aንግኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221445, 2214, N'Cህኤህአ', N'Cህኤህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221447, 2214, N'Eንድብኢር Tኦውን Aድምኢንስትርአትኢኦን', N'Eንድብኢር Tኦውን Aድምኢንስትርአትኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221450, 2214, N'Eዝህአ', N'Eዝህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221452, 2214, N'Gኤትአ', N'Gኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221454, 2214, N'Gኡምኤር', N'Gኡምኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221456, 2214, N'Mአርኤክኦ', N'Mአርኤክኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221458, 2214, N'Mኢህኡርኢንአአክልኢልኢ', N'Mኢህኡርኢንአአክልኢልኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221461, 2214, N'Wኦልኢክትኤ Tኦውን Aድምኢንስትርአኢኦን', N'Wኦልኢክትኤ Tኦውን Aድምኢንስትርአኢኦን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221565, 2215, N'ቦዲቲ ከተማ', N'ቦዲቲ ከተማ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221567, 2215, N'Dኦይኦግኤንአ', N'Dኦይኦግኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221570, 2215, N'ጊቤ', N'ጊቤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221581, 2215, N'Hኦስአንአ', N'Hኦስአንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221574, 2215, N'ምራብ ሶሮ', N'ምራብ ሶሮ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221576, 2215, N'Mኢስርአክ Bአድኦውኦክህ', N'Mኢስርአክ Bአድኦውኦክህ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221571, 2215, N'Sህኦንኤ Cኢትይ Aድምኢን', N'Sህኦንኤ Cኢትይ Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221682, 2216, N'Hአልአብአ Kኡልኢትኦ', N'Hአልአብአ Kኡልኢትኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221684, 2216, N'Wኤርአ Dኢጅኦ', N'Wኤርአ Dኢጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221787, 2217, N'Dአምብኦይአ', N'Dአምብኦይአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221789, 2217, N'Dኦይኦግኤንአ', N'Dኦይኦግኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221791, 2217, N'Hአድአርኦ Kኤትኤምአ Aስትኢድአድአር', N'Hአድአርኦ Kኤትኤምአ Aስትኢድአድአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221795, 2217, N'Sህኢንስህኢክህኦ Cኢትይ', N'Sህኢንስህኢክህኦ Cኢትይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221801, 2218, N'Kአርአትኤ_Cኢትይ_Aድምኢን', N'Kአርአትኤ_Cኢትይ_Aድምኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221804, 2218, N'Kኦልምኤ Cልኡስትኤር', N'Kኦልምኤ Cልኡስትኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221902, 2219, N'Hአልኢክህኦ Wኢርኢርኦኦ', N'Hአልኢክህኦ Wኢርኢርኦኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221905, 2219, N'Lአንፍኡርኦ', N'Lአንፍኡርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221907, 2219, N'Mኢስርአክ Aዝኤርንኤት', N'Mኢስርአክ Aዝኤርንኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (221911, 2219, N'Sኢልኢትኤ', N'Sኢልኢትኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222001, 2220, N'አባላ አባያ', N'አባላ አባያ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222003, 2220, N'ባይራ ኮይሻ', N'ባይራ ኮይሻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222006, 2220, N'ቦሎሶቦምቤ', N'ቦሎሶቦምቤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222009, 2220, N'ዳሞትጋሌ', N'ዳሞትጋሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222011, 2220, N'ዱጉና ፋንጎ', N'ዱጉና ፋንጎ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222013, 2220, N'ሁምቦ', N'ሁምቦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222015, 2220, N'ኪንዶ ዲዳዬ', N'ኪንዶ ዲዳዬ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (222018, 2220, N'ሶዶ ከተማ አስተዳደር', N'ሶዶ ከተማ አስተዳደር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305023, 3050, N'Mኤርስአ Kኤትኤምአ Aስትኤድአድኤር', N'Mኤርስአ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305127, 3051, N'Aብኤርግኤልኤ', N'Aብኤርግኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305129, 3051, N'Gአዝግኢብልአ', N'Gአዝግኢብልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305131, 3051, N'Sኤክኦትአ Zኡርኢአ', N'Sኤክኦትአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300101, 3001, N'አርጎባ ሊዩ', N'አርጎባ ሊዩ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300202, 3002, N'Aንክኤስህአ Gኡአግኡስአ', N'Aንክኤስህአ Gኡአግኡስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300205, 3002, N'Bኡርኢኤ Kኤትኤምአ Aስትኤድአድኤር', N'Bኡርኢኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300209, 3002, N'Dኤርአ', N'Dኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300211, 3002, N'Dኦይኦግኤንአ', N'Dኦይኦግኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300213, 3002, N'Fአግኢትአ Lኤክኦምአ', N'Fአግኢትአ Lኤክኦምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300215, 3002, N'Gኡአንግኡአ', N'Gኡአንግኡአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300301, 3003, N'Aድውአ', N'Aድውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300302, 3003, N'Bአህኢር Dአር Kኤትኤምአ Zኡርኢአ', N'Bአህኢር Dአር Kኤትኤምአ Zኡርኢአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300305, 3003, N'Eንኤብስኢኤ Sአር Mኢድኢር', N'Eንኤብስኢኤ Sአር Mኢድኢር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300308, 3003, N'Hኢድአር 11', N'Hኢድአር 11')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300902, 3009, N'Aድድኢስ Zኤምኤን', N'Aድድኢስ Zኤምኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300904, 3009, N'Aልኤፍአ', N'Aልኤፍአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300906, 3009, N'Aንድአብኤት', N'Aንድአብኤት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300947, 3009, N'Bኤንአ Tስኤምአይ', N'Bኤንአ Tስኤምአይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300950, 3009, N'ደሃና', N'ደሃና')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300952, 3009, N'Dኢንስህኦ', N'Dኢንስህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300954, 3009, N'Eብኢንአት', N'Eብኢንአት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300981, 3009, N'Fአርትአ', N'Fአርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300957, 3009, N'Gኡንአ Bኤግኢኤ Mኢድኢር', N'Gኡንአ Bኤግኢኤ Mኢድኢር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300960, 3009, N'Lኢብኦክኤምክኤም', N'Lኢብኦክኤምክኤም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300963, 3009, N'Mኤክኤትኤውአ', N'Mኤክኤትኤውአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300965, 3009, N'Sኤድኢኤ Mኡጅአ', N'Sኤድኢኤ Mኡጅአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (300967, 3009, N'Tአክህግአይኢንት', N'Tአክህግአይኢንት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301103, 3011, N'Eንድኤርትአ', N'Eንድኤርትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301379, 3013, N'Aድኤአ', N'Aድኤአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301381, 3013, N'Aልብኡክኦ', N'Aልብኡክኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301383, 3013, N'አሌ', N'አሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301385, 3013, N'አንጎለላነታራ', N'አንጎለላነታራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301388, 3013, N'Bኦርኤንአ', N'Bኦርኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301390, 3013, N'Cህኢልግአ', N'Cህኢልግአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301392, 3013, N'Dኤድኦ', N'Dኤድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301394, 3013, N'Dኤክአ Sኦፍትኡ', N'Dኤክአ Sኦፍትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301396, 3013, N'Dኤምብኤክህአ', N'Dኤምብኤክህአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301398, 3013, N'Eአስት Eምኤ', N'Eአስት Eምኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301393, 3013, N'Gኢድአ Aይአንአ', N'Gኢድአ Aይአንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301344, 3013, N'Gኦዝአምኤን', N'Gኦዝአምኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301311, 3013, N'ሃሉ', N'ሃሉ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301313, 3013, N'Jአምአ', N'Jአምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301315, 3013, N'Kአልኡ', N'Kአልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301317, 3013, N'Kኤልአልአ', N'Kኤልአልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301318, 3013, N'Kኦልአ Tኤምብይኤን', N'Kኦልአ Tኤምብይኤን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301322, 3013, N'Lኤግአምብኦ', N'Lኤግአምብኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301343, 3013, N'Mኤህአል Sአይኢንት', N'Mኤህአል Sአይኢንት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301324, 3013, N'Sአይንት', N'Sአይንት')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301327, 3013, N'Tኡልኡ Gኡልኤድ', N'Tኡልኡ Gኡልኤድ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301329, 3013, N'Wኤርኤኢልኡ', N'Wኤርኤኢልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301501, 3015, N'አቢቹ እና ግኒ ወረዳ', N'አቢቹ እና ግኒ ወረዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (301536, 3015, N'Bአብአ_Gአክህኦ', N'Bአብአ_Gአክህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401877, 4018, N'Gአንድአ Gኡጅኤ', N'Gአንድአ Gኡጅኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402182, 4021, N'ባቾ', N'ባቾ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402184, 4021, N'Gኦርኦ', N'Gኦርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402186, 4021, N'ከርሳ ማሊማ', N'ከርሳ ማሊማ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402188, 4021, N'Sአድኤን Sኦድድኦ', N'Sአድኤን Sኦድድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402191, 4021, N'Wኤንክህኢ', N'Wኤንክህኢ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402701, 4027, N'Dኡክአም', N'Dኡክአም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (402703, 4027, N'Dኡክአም', N'Dኡክአም')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403010, 4030, N'Gኤልአን', N'Gኤልአን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403110, 4031, N'Aድኦልአ', N'Aድኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403113, 4031, N'Aግአ Wአይኡ', N'Aግአ Wአይኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403115, 4031, N'Bኦርኤ', N'Bኦርኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403133, 4031, N'Dአምአ', N'Dአምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403118, 4031, N'Gኦርኦ Dኦልአ', N'Gኦርኦ Dኦልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403130, 4031, N'Hአርኦ Wኤልአብኡ', N'Hአርኦ Wኤልአብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403123, 4031, N'Nኤግኤልኤ Kኤትኤምአ Aስትኤድአድኤር', N'Nኤግኤልኤ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403126, 4031, N'Sህአክኢስኦ Kኤትኤምአ Aስትኤድአድኤር', N'Sህአክኢስኦ Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403601, 4036, N'Hኦልኤትአ', N'Hኦልኤትአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403703, 4037, N'Aብኤድኦንግኦርኦ', N'Aብኤድኦንግኦርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403706, 4037, N'Gኡድኡርኡ', N'Gኡድኡርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403708, 4037, N'Hኦርኦ', N'Hኦርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403710, 4037, N'ሆርኦ(ሽአምብኡ', N'Horo(shambu)')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403733, 4037, N'Jኢምአ Aርጅኦ', N'Jኢምአ Aርጅኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403956, 4039, N'Aድኢይኦ', N'Aድኢይኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403900, 4039, N'አምቦ ዙሪያይ', N'አምቦ ዙሪያይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403907, 4039, N'Bኡርክአ Dህኢንትኡ', N'Bኡርክአ Dህኢንትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403910, 4039, N'Cኦርአ Bኦትአር', N'Cኦርአ Bኦትአር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403912, 4039, N'ዲጋ', N'ዲጋ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403914, 4039, N'ኤባንቱ', N'ኤባንቱ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403916, 4039, N'Gኤርአ', N'Gኤርአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403918, 4039, N'ጉባ ኮሪቻ', N'ጉባ ኮሪቻ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403946, 4039, N'ጃርሶ', N'ጃርሶ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403994, 4039, N'Kኡርፍአ Cህኤልኤ', N'Kኡርፍአ Cህኤልኤ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403987, 4039, N'Lኢምኡ Kኦስአ', N'Lኢምኡ Kኦስአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403927, 4039, N'Mኤንክህኦ', N'Mኤንክህኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403929, 4039, N'ኖኖ ቤንጃ', N'ኖኖ ቤንጃ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403921, 4039, N'Oምኦ Nአድአ', N'Oምኦ Nአድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403923, 4039, N'Sኤትኤምአ', N'Sኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (403925, 4039, N'Sኢግኢምኦ', N'Sኢግኢምኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404018, 4040, N'ጂማ', N'ጂማ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404206, 4042, N'Cህአንክአ Wኦርኤድአ', N'Cህአንክአ Wኦርኤድአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404209, 4042, N'Dአምብኢ Dኦልልኦ Tኦውን', N'Dአምብኢ Dኦልልኦ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404212, 4042, N'ጉቶጊዳ', N'ጉቶጊዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404214, 4042, N'Jኢምአ Hኦርኦ', N'Jኢምአ Hኦርኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404217, 4042, N'Yኤምአልኦግኢ Wአልአል', N'Yኤምአልኦግኢ Wአልአል')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404510, 4045, N'አሬና ቡሉክ', N'አሬና ቡሉክ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404512, 4045, N'Dኤልኦ Mኤንአ', N'Dኤልኦ Mኤንአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404515, 4045, N'Gኦብአ', N'Gኦብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404516, 4045, N'Gኦብአ Kኤትኤምአ', N'Gኦብአ Kኤትኤምአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404519, 4045, N'Mኤድአ Wኤልአብኡ', N'Mኤድአ Wኤልአብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404723, 4047, N'አምቦ ዙሪያይ', N'አምቦ ዙሪያይ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404726, 4047, N'ባቢሌ', N'ባቢሌ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404728, 4047, N'ዳራ', N'ዳራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404730, 4047, N'ዶዶላ ከተማ አስተዳደር', N'ዶዶላ ከተማ አስተዳደር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404733, 4047, N'ጉቶጊዳ', N'ጉቶጊዳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404736, 4047, N'ኮኮሳ', N'ኮኮሳ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404738, 4047, N'ኔንሴቦ', N'ኔንሴቦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (404740, 4047, N'ሻሸማኔ', N'ሻሸማኔ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405163, 4051, N'Gኢምብኢ Tኦውን', N'Gኢምብኢ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405165, 4051, N'Hአርኡ', N'Hአርኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405167, 4051, N'ጃርሶ', N'ጃርሶ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405169, 4051, N'Kኦንድአልአ', N'Kኦንድአልአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405171, 4051, N'Lኤትአ Sኢብኡ', N'Lኤትአ Sኢብኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405173, 4051, N'Mአንድኢ Tኦውን', N'Mአንድኢ Tኦውን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405176, 4051, N'Nኦልኤ Kአብአ', N'Nኦልኤ Kአብአ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405177, 4051, N'Yኡብድኦ', N'Yኡብድኦ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405379, 4053, N'Dአውኤ Kአክህኢን', N'Dአውኤ Kአክህኢን')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405382, 4053, N'Dኤድኤር', N'Dኤድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405384, 4053, N'Gኢንኢር Kኤትኤምአ Aስትኤድአድኤር', N'Gኢንኢር Kኤትኤምአ Aስትኤድአድኤር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405387, 4053, N'Rአይኢትኡ', N'Rአይኢትኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405547, 4055, N'Aድአምኢትኡልኡ', N'Aድአምኢትኡልኡ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (405625, 4056, N'ሀሮ ሊሙ', N'ሀሮ ሊሙ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (406014, 4060, N'ሳባታ', N'ሳባታ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401769, 4017, N'ቾራ', N'ቾራ')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (401710, 4017, N'ዳዌ ሰረር', N'ዳዌ ሰረር')
INSERT [dbo].[woredas] ([woreda_id], [zone_id], [woreda_name_am], [woreda_name_en]) VALUES (305027, 3050, N'Kአልኡ', N'Kአልኡ')
GO
SET IDENTITY_INSERT [dbo].[woredas] OFF
GO
