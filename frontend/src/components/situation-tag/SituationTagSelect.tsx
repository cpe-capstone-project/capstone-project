import React, { useEffect, useState } from "react";
import { Select, Tag, Button, Modal, message, Space, ColorPicker, Form, Input } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { SituationTagInterface } from "../../interfaces/ISituationTag";
import { GetSituationTags, CreateSituationTag, DeleteSituationTag } from "../../services/https/SituationTag";

const { Option } = Select;

interface Props {
  value?: number;
  onChange?: (id: number | undefined) => void;
}

export default function SituationTagSelect({ value, onChange }: Props) {
  const [tags, setTags] = useState<SituationTagInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const [form] = Form.useForm();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await GetSituationTags();
      setTags(data);
    } catch {
      message.error("โหลด Tag ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async () => {
    try {
      const values = await form.validateFields(); // ตรวจสอบ required
      const tag = await CreateSituationTag({ Name: values.Name, Color: values.Color });
      if (tag) {
        setTags((prev) => [...prev, tag]);
        message.success("เพิ่ม Tag สำเร็จ ✅");
        onChange && onChange(tag.ID);
        setModalVisible(false);
        form.resetFields();
      } else {
        message.error("เพิ่ม Tag ไม่สำเร็จ ❌");
      }
    } catch {
      // ถ้ายังไม่กรอกค่า required จะไม่ปิด modal และแสดง validation
    }
  };

  const handleDeleteTag = async (tag?: SituationTagInterface) => {
    if (!tag) return;
    if (!(tag as any).IsUserCreated) {
      message.warning("ไม่สามารถลบ Tag ของระบบได้ ❌");
      return;
    }
    try {
      await DeleteSituationTag(tag.ID!);
      setTags((prev) => prev.filter((t) => t.ID !== tag.ID));
      message.success("ลบ Tag สำเร็จ ✅");
      if (value === tag.ID) onChange && onChange(undefined);
    } catch {
      message.error("ลบ Tag ไม่สำเร็จ ❌");
    }
  };

  const tagRender = (props: any) => {
    const { label, value } = props;
    const tag = tags.find((t) => t.ID === value);
    if (!tag) return <Tag>{label}</Tag>;

    return (
      <Tag
        closable={!!(tag as any).IsUserCreated}
        onClose={() => handleDeleteTag(tag)}
        color={tag.Color || undefined}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          showSearch
          placeholder="เลือก Tag"
          value={value}
          onChange={onChange}
          loading={loading}
          allowClear
          style={{ width: "100%" }}
          optionLabelProp="label"
          tagRender={tagRender}
          virtual={false}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          getPopupContainer={(trigger) => trigger.parentNode as HTMLElement}
        >
          {tags.map((tag) => (
            <Option key={tag.ID} value={tag.ID} label={tag.Name}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span>{tag.Name}</span>
                {(tag as any).IsUserCreated && (
                  <DeleteOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag);
                    }}
                    style={{ marginLeft: "auto", color: "red", cursor: "pointer" }}
                  />
                )}
              </div>
            </Option>
          ))}
        </Select>

        <Button
          type="dashed"
          onClick={() => setModalVisible(true)}
          icon={<PlusOutlined />}
          style={{ width: "100%" }}
        >
          สร้าง Tag ใหม่
        </Button>
      </Space>

      <Modal
        open={modalVisible}
        title="สร้าง Tag ใหม่"
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setColorOpen(false);
        }}
        onOk={handleAddTag}
        okText="บันทึก"
      >
        <Form form={form} layout="vertical" initialValues={{ Color: "#1890ff" }}>
          <Form.Item label="เลือกสี" name="Color" rules={[{ required: true, message: "กรุณาเลือกสี" }]}>
            <ColorPicker
              open={colorOpen}
              onOpenChange={setColorOpen}
              showText={(color) => <span>{color.toHexString()}</span>}
            />
          </Form.Item>
          <Form.Item label="ชื่อ Tag" name="Name" rules={[{ required: true, message: "กรุณากรอกชื่อ Tag" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
