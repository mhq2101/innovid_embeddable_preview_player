DROP TABLE IF EXISTS table_Campaign;
CREATE TEMPORARY TABLE table_Campaign (
    IdCampaign INTEGER,
    IdClient INTEGER,
    Client VARCHAR(255),
    IdAdvAgency INTEGER,
    AdvAgency VARCHAR(255),
    Name VARCHAR(255),
    IdBrand INTEGER,
    IdVertical INTEGER,
    IdCountry VARCHAR(255),
    Country VARCHAR(255),
    IdSalesForce VARCHAR(45),
    DealSource INTEGER,
    Brand VARCHAR(255),
    Vertical VARCHAR(255),
    IdAdvertiser INTEGER,
    Advertiser VARCHAR(255),
    StartDate DATE,
    EndDate DATE,
    ActualStartDate DATE,
    ActualEndDate DATE,
    -- Clickthroughs VARCHAR(65535) DEFAULT NULL,
    IAS_Advertiser_ID VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (IdCampaign)
    );

INSERT INTO table_Campaign
SELECT
    c.IdCampaign,
    NVL(c.IdClient,0) AS IdClient,
    cl.Name AS Client,
    c.IdAdvertisingAgency AS IdAdvAgency,
    agcy.Name AS AdvAgency,
    REPLACE(c.Name, '	', '') AS Name,
    c.IdBrand, 
    c.IdVertical,
    DECODE(c.Country,NULL,c.Country) AS IdCountry,
    cn.Name AS Country,
    c.SalesForceID AS IdSalesForce,
    c.DealSource,
    br.Name AS Brand, 
    vert.Name AS Vertical,
    br.IdAdvertiser, 
    adv.Name AS Advertiser,
    c.StartDate, 
    c.EndDate,
    meta.ActualStartDate, 
    meta.ActualEndDate
FROM
    Campaign c
	INNER JOIN Vertical vert ON vert.IdVertical = c.IdVertical
	INNER JOIN Brand br ON br.IdBrand = c.IdBrand
	INNER JOIN Advertiser adv ON adv.IdAdvertiser = br.IdAdvertiser
	LEFT JOIN Client agcy ON agcy.IdClient = c.IdAdvertisingAgency
	LEFT JOIN Client cl ON cl.IdClient = c.IdClient
	INNER JOIN PlacementsGroup plg ON plg.IdCampaign = c.IdCampaign
	INNER JOIN Placement pl ON pl.IdPlacementsGroup = plg.IdPlacementsGroup
	INNER JOIN Video v ON v.IdVideo = pl.IdVideo
	LEFT JOIN CampaignClickThru cct ON cct.IdCampaign = c.IdCampaign
	LEFT JOIN StatisticsAggCampaignMetadata meta ON meta.IdCampaign = c.IdCampaign
	LEFT JOIN SupportCountry cn ON cn.CountryCode = c.Country
WHERE
    meta.ActualEndDate >= '2018-08-05'
	AND meta.ActualStartDate <= '2018-09-09'
	and c.IdCampaign in (59270) 

GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20;
DROP TABLE IF EXISTS table_PlacementsGroup;
CREATE TEMPORARY TABLE IF NOT EXISTS table_PlacementsGroup (
    IdPlacementsGroup INTEGER,
    IdPlatform INTEGER,
    AdInterface VARCHAR(255),
    IdCampaign INTEGER,
    IdPublisher INTEGER,
    Publisher VARCHAR(255),
    PublisherURL VARCHAR(255),
    Name VARCHAR(1024),
    Placement_Tag VARCHAR(255),
    IdChannel INTEGER,
    Channel VARCHAR(1024),
    StartDate DATE,
    EndDate DATE,
    CostRate DECIMAL,
    BookedImpressions INTEGER,
    VerificationBlocking INT2,
    Platform VARCHAR(255),
    Tag_Type VARCHAR(255),
    ComScore_vCE_Enabled INT2 DEFAULT 0,
    Comscore_Viewability_Enabled Int2 DEFAULT 0,
    IAS_Enabled INT2 DEFAULT 0,
    IAS_ID VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (IdPlacementsGroup)
);

INSERT INTO table_PlacementsGroup
SELECT DISTINCT
	plg.IdPlacementsGroup,
    plg.IdPlatform,
    plat.Adinterface,
    plg.IdCampaign,
	plg.IdPublisher,
	pub.Name AS Publisher,
    pub.URL AS PublisherURL,
	REPLACE(plg.Name, 'Â»', '»') AS Name,
	DECODE(plg.ServingMode, 'SECURE', 'https://','http://') || 'rtr.innovid.com/' || plg.Hash AS Placement_Tag,
    plg.IdChannel,
	BTRIM(ch.Name, '2') AS Channel,
	plg.StartDate, plg.EndDate,
	plg.CostRate,
	plg.BookedImpressions,
	plg.VerificationBlocking,
	plat.Name AS Platform,
	CASE
		WHEN plg.IdPlatform IN (5, 10, 11, 12, 16, 18, 20, 27, 31, 32) THEN 'VPAID (FLASH)'
        WHEN plg.IdPlatform = 30 THEN 'VPAID (HTML)'
        WHEN plg.IdPlatform = 37 THEN 'VPAID (Hybrid)'
        WHEN plg.IdPlatform = 21 THEN 'CUSTOM'
		WHEN plg.useVAST = 1 THEN 'VAST'
		ELSE '1x1'
    END AS Tag_Type
FROM
	PlacementsGroup plg
	INNER JOIN table_Campaign c ON c.IdCampaign = plg.IdCampaign
	INNER JOIN Client pub ON pub.IdClient = plg.IdPublisher
	INNER JOIN Channel ch ON ch.IdChannel = plg.IdChannel
	LEFT JOIN Platform plat ON plat.IdPlatform = plg.IdPlatform
    LEFT JOIN Placement pl ON pl.IdPlacementsGroup = plg.IdPlacementsGroup
    LEFT JOIN Video v ON v.IdVideo = pl.IdVideo

    ;
 DROP TABLE IF EXISTS table_Placement;
CREATE TEMPORARY TABLE IF NOT EXISTS table_Placement (
	IdPlacementsGroup INTEGER,
	Id INTEGER,
	Hash VARCHAR(128),
	IdPublisher INTEGER,
	IdChannel INTEGER,
	IdVideo INTEGER,
	StartDate TIMESTAMP,
	IdProject INTEGER,
	Active INT2,
	Rotation DECIMAL,
	Name VARCHAR(1024),
	CreativePreviewURL VARCHAR(255),
	Atlas_ID VARCHAR(128) DEFAULT NULL,
	DFA_Ad_ID VARCHAR(128) DEFAULT NULL,
	DFA_Campaign_ID VARCHAR(128) DEFAULT NULL,
	DFA_Creative_ID VARCHAR(128) DEFAULT NULL,
	DFA_Network_ID VARCHAR(128) DEFAULT NULL,
	DFA_Placement_ID VARCHAR(128) DEFAULT NULL,
    DFA_Site VARCHAR(128) DEFAULT NULL,
	NielsenURL_A VARCHAR(4096) DEFAULT NULL,
	NielsenURL_B VARCHAR(4096) DEFAULT NULL,
	IX_Banner_ID VARCHAR(128) DEFAULT NULL,
    Sizmek_ID VARCHAR(128) DEFAULT NULL,
	PRIMARY KEY (Id)
);

INSERT INTO table_Placement
SELECT DISTINCT
	pl.IdPlacementsGroup,
    pl.IdPlacement AS Id,
    pl.Hash,
    pl.IdPublisher,
    pl.IdChannel,
    pl.IdVideo,
    pl.FromDate AS StartDate,
    pl.IdProject,
    pl.Active,
    pl.Rotation,
    pl.Name,
	'http://preview.innovid.com/player.html?h=' || f_inno_hash(pl.IdProject) AS CreativePreviewURL
FROM
	Placement pl
	INNER JOIN table_PlacementsGroup plg ON plg.IdPlacementsGroup = pl.IdPlacementsGroup
	INNER JOIN table_Campaign c ON c.IdCampaign = plg.IdCampaign
	INNER JOIN Video v ON v.IdVideo = pl.IdVideo

 ;
DROP TABLE IF EXISTS table_Video;
CREATE TEMPORARY TABLE IF NOT EXISTS table_Video (
    IdVideo INTEGER,
    Name VARCHAR(255),
    IdFormat INTEGER,
    Format VARCHAR(255),
    IdCampaign INTEGER,
    Duration INTEGER,
    Size VARCHAR(128),
    IdVideoType INTEGER,
    PRIMARY KEY (IdVideo)
);

INSERT INTO table_Video
SELECT DISTINCT
    v.IdVideo,
    v.Name,
    v.IdFormat,
    f.Name AS Format,
    v.IdCampaign,
    ROUND(Duration/1000) AS Duration,
    v.Width || 'x' || v.Height AS Size,
    v.IdVideoType AS  IdVideoType
FROM
    Video v
	INNER JOIN table_Placement ON table_Placement.IdVideo = v.IdVideo
	INNER JOIN Format f ON f.IdFormat = v.IdFormat
;



SELECT
  s.Date,
  c.IdCampaign,
  c.Name as Campaign,
  plg.Tag_Type,
  plg.IdPlacementsGroup as "Placement ID",
  plg.Name as Placement,
  plg.Publisher,
  v.IdVideo as "Creative ID",
  v.Name as "Creative",
  split_part(s.EventValue,',',1) as "video version",
  s.device,
  s.os,
  --split_part(s.EventValue,',',3) as "other",
  COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) AS Impressions,
  NVL(COUNT(CASE WHEN split_part(s.EventValue,',',2) = 'ClickThru' THEN '*' END),0) AS Clickthroughs,
  COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_25' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) AS "25%",
  COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_50' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) AS "50%",
  COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_75' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) AS "75%",
  COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_complete' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) AS "100%",
  CASE WHEN COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) = 0 THEN CONCAT(0.00,'%') ELSE CONCAT(NVL(ROUND(100 * COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_complete' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL/COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL,2),0.00), '%') END AS CompletionRate,
  CASE WHEN COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) = 0 THEN CONCAT(0.00,'%') ELSE CONCAT(ROUND(25 * (COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_25' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL
     + COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_50' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL 
     + COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_75' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL 
     + COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'video_playback_complete' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL)/COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL,2),'%') END AS PercentAdViewed,
  CASE WHEN COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END) = 0 THEN CONCAT(0.00,'%') ELSE CONCAT(NVL(ROUND(100 * COUNT(CASE WHEN split_part(s.EventValue,',',2) = 'ClickThru' THEN '*' END)::DECIMAL/COUNT(CASE WHEN split_part(s.EventValue,',',3) = 'Video_Version' AND split_part(s.EventValue,',',2) = 'Progress' THEN '*' END)::DECIMAL,2),0), '%') END AS CTR
FROM spectrum_prod.raw_pixel_data s
INNER JOIN table_Placement p on p.Hash = s.PlacementHash
INNER JOIN table_Video v on v.IdVideo = p.IdVideo
INNER JOIN table_PlacementsGroup plg on plg.IdPlacementsGroup = p.IdPlacementsGroup
INNER JOIN table_Campaign c on c.IdCampaign = plg.IdCampaign
where s.eventid in('Custom_Track')
AND s.Date between  '2018-08-05' and '2018-09-09'
GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12;