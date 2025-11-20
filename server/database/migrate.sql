-- 为Members表添加photo_filename字段来支持本地图片文件
ALTER TABLE Members ADD COLUMN photo_filename TEXT;

-- 更新现有记录的photo_filename（如果photo_url有值但photo_filename为空）
UPDATE Members 
SET photo_filename = CASE 
    WHEN photo_url IS NOT NULL AND photo_url != '' THEN 
        -- 从URL中提取文件名或使用默认值
        CASE 
            WHEN photo_url LIKE 'http://%' THEN 'default.jpg'
            ELSE photo_url
        END
    ELSE NULL 
END 
WHERE photo_filename IS NULL;